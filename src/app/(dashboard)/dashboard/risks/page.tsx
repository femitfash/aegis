"use client";

import { useState, useEffect, useCallback } from "react";

interface Risk {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  score: number;
  status: "identified" | "assessed" | "mitigated" | "accepted" | "closed";
  owner: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<Risk["status"], string> = {
  identified: "Identified",
  assessed: "Assessed",
  mitigated: "Mitigated",
  accepted: "Accepted",
  closed: "Closed",
};

const STATUS_COLORS: Record<Risk["status"], string> = {
  identified: "bg-red-100 text-red-700",
  assessed: "bg-orange-100 text-orange-700",
  mitigated: "bg-green-100 text-green-700",
  accepted: "bg-blue-100 text-blue-700",
  closed: "bg-gray-100 text-gray-700",
};

function RiskScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 20
      ? "bg-red-100 text-red-700 font-bold"
      : score >= 15
      ? "bg-orange-100 text-orange-700 font-bold"
      : score >= 10
      ? "bg-yellow-100 text-yellow-700 font-semibold"
      : "bg-green-100 text-green-700 font-semibold";
  const label =
    score >= 20 ? "Critical" : score >= 15 ? "High" : score >= 10 ? "Medium" : "Low";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${cls}`}>
      <span className="font-mono">{score}</span>
      <span className="opacity-70">·</span>
      <span>{label}</span>
    </span>
  );
}

type SortField = "score" | "title" | "updatedAt" | "status";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRisk(row: any): Risk {
  return {
    id: row.risk_id || row.id,
    title: row.title || "Untitled Risk",
    category: row.category || "Security",
    likelihood: row.inherent_likelihood ?? 0,
    impact: row.inherent_impact ?? 0,
    score: row.inherent_score ?? 0,
    status: (row.status as Risk["status"]) || "identified",
    owner: row.owner_name || "Team member",
    updatedAt: (row.updated_at || row.created_at || "").slice(0, 10),
  };
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<Risk["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/risks");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const { risks: data, error: apiError } = await res.json();
      if (apiError) {
        // API returned a soft error (e.g. table setup issue) but still gave us data
        console.warn("Risks API warning:", apiError);
      }
      setRisks((data || []).map(mapDbRisk));
    } catch (err) {
      console.error("Failed to fetch risks:", err);
      setError("Could not load risks. Check the console for details.");
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // Listen for copilot risk creation events
  useEffect(() => {
    const handler = () => fetchRisks();
    window.addEventListener("grc:risk-created", handler);
    return () => window.removeEventListener("grc:risk-created", handler);
  }, [fetchRisks]);

  const filtered = risks
    .filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "score") return (a.score - b.score) * dir;
      if (sortBy === "title") return a.title.localeCompare(b.title) * dir;
      if (sortBy === "updatedAt") return a.updatedAt.localeCompare(b.updatedAt) * dir;
      if (sortBy === "status") return a.status.localeCompare(b.status) * dir;
      return 0;
    });

  const stats = {
    total: risks.length,
    critical: risks.filter((r) => r.score >= 20).length,
    high: risks.filter((r) => r.score >= 15 && r.score < 20).length,
    open: risks.filter((r) => r.status === "identified" || r.status === "assessed").length,
  };

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <span className="opacity-30">↕</span>;
    return <span>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Risk Register</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your organization&apos;s risk landscape
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRisks}
            disabled={loading}
            className="px-3 py-2 rounded-md border text-sm hover:bg-accent transition-colors disabled:opacity-50"
            title="Refresh"
          >
            {loading ? "⟳" : "↻"} Refresh
          </button>
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>('[placeholder="Ask anything about GRC..."]');
              if (input) {
                input.value = "Register a new risk: ";
                input.focus();
              }
            }}
          >
            + Register Risk
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Risks", value: stats.total, color: "text-foreground" },
          { label: "Critical", value: stats.critical, color: "text-red-600" },
          { label: "High", value: stats.high, color: "text-orange-600" },
          { label: "Open", value: stats.open, color: "text-blue-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>
              {loading ? <span className="text-muted-foreground">—</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-orange-50 border border-orange-200 text-sm text-orange-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search risks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <div className="flex gap-1">
          {(["all", "identified", "assessed", "mitigated", "accepted"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-accent"
              }`}
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filtered.length} of ${risks.length} risks`}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading risks...</p>
          </div>
        ) : risks.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-lg font-medium">No risks registered yet</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Use the GRC Copilot on the right to register your first risk — just describe it in plain English.
            </p>
            <p className="text-xs mt-3 text-muted-foreground/60">
              Try: &quot;Register a risk about our S3 buckets being publicly accessible&quot;
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">ID</th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("title")}
                >
                  Risk Title <SortIcon field="title" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-10">L</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground w-10">I</th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground w-36"
                  onClick={() => toggleSort("score")}
                >
                  Score <SortIcon field="score" />
                </th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Owner</th>
                <th
                  className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("updatedAt")}
                >
                  Updated <SortIcon field="updatedAt" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((risk, i) => (
                <tr
                  key={risk.id}
                  className={`border-b last:border-0 hover:bg-accent/30 cursor-pointer transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{risk.id}</td>
                  <td className="px-4 py-3 font-medium">{risk.title}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
                      {risk.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{risk.likelihood}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{risk.impact}</td>
                  <td className="px-4 py-3">
                    <RiskScoreBadge score={risk.score} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[risk.status]}`}
                    >
                      {STATUS_LABELS[risk.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{risk.owner}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{risk.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && risks.length > 0 && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground border-t">
            <p className="text-lg">No risks match your filter</p>
            <p className="text-sm mt-1">Try adjusting your search or status filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
