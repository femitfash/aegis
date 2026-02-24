"use client";

import { useState } from "react";

interface Evidence {
  id: string;
  evidenceId: string;
  title: string;
  sourceType: "manual" | "automated" | "integration";
  controlCode: string;
  controlTitle: string;
  status: "collected" | "pending" | "overdue" | "stale" | "rejected";
  dueDate: string;
  collectedAt?: string;
  collector: string;
  frameworks: string[];
  fileType?: string;
}

const MOCK_EVIDENCE: Evidence[] = [
  { id: "1", evidenceId: "EVD-001", title: "Q4 2025 Access Review Report", sourceType: "manual", controlCode: "AC-02", controlTitle: "Account Management", status: "collected", dueDate: "2026-01-31", collectedAt: "2026-01-28", collector: "Alice Chen", frameworks: ["SOC2", "ISO27001"], fileType: "PDF" },
  { id: "2", evidenceId: "EVD-002", title: "Penetration Test Report - Nov 2025", sourceType: "manual", controlCode: "RA-05", controlTitle: "Vulnerability Monitoring", status: "collected", dueDate: "2025-12-01", collectedAt: "2025-11-30", collector: "Bob Smith", frameworks: ["SOC2"], fileType: "PDF" },
  { id: "3", evidenceId: "EVD-003", title: "Security Awareness Training Records", sourceType: "manual", controlCode: "AT-02", controlTitle: "Security Training", status: "pending", dueDate: "2026-03-01", collector: "Diana Lee", frameworks: ["SOC2", "ISO27001"] },
  { id: "4", evidenceId: "EVD-004", title: "Vendor Risk Assessment - AWS", sourceType: "manual", controlCode: "VR-01", controlTitle: "Vendor Risk Assessment", status: "overdue", dueDate: "2026-02-10", collector: "Diana Lee", frameworks: ["SOC2", "ISO27001"] },
  { id: "5", evidenceId: "EVD-005", title: "MFA Enforcement Screenshot", sourceType: "manual", controlCode: "IA-02", controlTitle: "Multi-Factor Authentication", status: "collected", dueDate: "2026-01-15", collectedAt: "2026-01-14", collector: "Alice Chen", frameworks: ["SOC2"], fileType: "PNG" },
  { id: "6", evidenceId: "EVD-006", title: "CloudTrail Logs - January 2026", sourceType: "automated", controlCode: "AU-02", controlTitle: "Audit Event Logging", status: "collected", dueDate: "2026-02-01", collectedAt: "2026-02-01", collector: "System", frameworks: ["SOC2", "ISO27001", "NIST"], fileType: "JSON" },
  { id: "7", evidenceId: "EVD-007", title: "Firewall Rules Export", sourceType: "automated", controlCode: "SC-07", controlTitle: "Boundary Protection", status: "stale", dueDate: "2026-01-01", collectedAt: "2025-10-15", collector: "System", frameworks: ["SOC2", "NIST"], fileType: "CSV" },
  { id: "8", evidenceId: "EVD-008", title: "Data Encryption Verification", sourceType: "integration", controlCode: "SC-08", controlTitle: "Transmission Confidentiality", status: "collected", dueDate: "2026-02-15", collectedAt: "2026-02-14", collector: "GitHub Actions", frameworks: ["SOC2", "ISO27001"], fileType: "JSON" },
  { id: "9", evidenceId: "EVD-009", title: "Q1 2026 Incident Response Test", sourceType: "manual", controlCode: "IR-04", controlTitle: "Incident Handling", status: "pending", dueDate: "2026-03-31", collector: "Bob Smith", frameworks: ["SOC2", "NIST"] },
  { id: "10", evidenceId: "EVD-010", title: "Patch Management Report - Feb 2026", sourceType: "automated", controlCode: "SI-02", controlTitle: "Flaw Remediation", status: "pending", dueDate: "2026-02-28", collector: "System", frameworks: ["SOC2"] },
  { id: "11", evidenceId: "EVD-011", title: "Employee Separation Checklist Q4", sourceType: "manual", controlCode: "AC-02", controlTitle: "Account Management", status: "stale", dueDate: "2025-12-31", collectedAt: "2025-11-20", collector: "Diana Lee", frameworks: ["SOC2"], fileType: "XLSX" },
  { id: "12", evidenceId: "EVD-012", title: "Annual Risk Assessment Document", sourceType: "manual", controlCode: "RA-03", controlTitle: "Risk Assessment", status: "collected", dueDate: "2026-02-01", collectedAt: "2026-01-25", collector: "Alice Chen", frameworks: ["SOC2", "ISO27001", "NIST"], fileType: "PDF" },
];

const STATUS_COLORS: Record<Evidence["status"], string> = {
  collected: "bg-green-100 text-green-700",
  pending: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  stale: "bg-orange-100 text-orange-700",
  rejected: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS: Record<Evidence["status"], string> = {
  collected: "✅",
  pending: "⏳",
  overdue: "🚨",
  stale: "⚠️",
  rejected: "❌",
};

const SOURCE_ICONS: Record<Evidence["sourceType"], string> = {
  manual: "👤",
  automated: "🤖",
  integration: "🔗",
};

const FILE_ICONS: Record<string, string> = {
  PDF: "📄",
  PNG: "🖼️",
  CSV: "📊",
  JSON: "📝",
  XLSX: "📊",
};

export default function EvidencePage() {
  const [statusFilter, setStatusFilter] = useState<Evidence["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("all");

  const filtered = MOCK_EVIDENCE.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (frameworkFilter !== "all" && !e.frameworks.includes(frameworkFilter)) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.controlCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    collected: MOCK_EVIDENCE.filter((e) => e.status === "collected").length,
    pending: MOCK_EVIDENCE.filter((e) => e.status === "pending").length,
    overdue: MOCK_EVIDENCE.filter((e) => e.status === "overdue").length,
    stale: MOCK_EVIDENCE.filter((e) => e.status === "stale").length,
  };

  const isOverdue = (dueDate: string, status: Evidence["status"]) => {
    return status === "overdue" || (status === "pending" && new Date(dueDate) < new Date());
  };

  const getDaysUntil = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return "Due today";
    return `Due in ${days}d`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Evidence Collection</h1>
          <p className="text-muted-foreground mt-1">
            Collect and manage compliance evidence for your controls
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-accent transition-colors">
            Request Evidence
          </button>
          <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Upload Evidence
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Collected", value: stats.collected, color: "text-green-600", icon: "✅" },
          { label: "Pending", value: stats.pending, color: "text-blue-600", icon: "⏳" },
          { label: "Overdue", value: stats.overdue, color: "text-red-600", icon: "🚨" },
          { label: "Stale", value: stats.stale, color: "text-orange-600", icon: "⚠️" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => setStatusFilter(label.toLowerCase() as Evidence["status"])}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              <span>{icon}</span>
            </div>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search evidence..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary w-56"
        />
        <div className="flex gap-1">
          {(["all", "collected", "pending", "overdue", "stale"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "border hover:bg-accent"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["all", "SOC2", "ISO27001", "NIST"].map((f) => (
            <button
              key={f}
              onClick={() => setFrameworkFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                frameworkFilter === f ? "bg-primary/20 text-primary border border-primary/30" : "border hover:bg-accent"
              }`}
            >
              {f === "all" ? "All Frameworks" : f}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} items
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground w-24">ID</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Evidence</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Control</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Collector</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Frameworks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ev, i) => (
              <tr
                key={ev.id}
                className={`border-b last:border-0 hover:bg-accent/30 cursor-pointer transition-colors ${
                  i % 2 === 0 ? "" : "bg-muted/10"
                } ${ev.status === "overdue" ? "bg-red-50/30" : ""}`}
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{ev.evidenceId}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span>{ev.fileType ? FILE_ICONS[ev.fileType] || "📎" : "📎"}</span>
                    <div>
                      <p className="font-medium">{ev.title}</p>
                      {ev.collectedAt && (
                        <p className="text-xs text-muted-foreground">
                          Collected {ev.collectedAt}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-mono text-xs font-semibold">{ev.controlCode}</span>
                    <p className="text-xs text-muted-foreground">{ev.controlTitle}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs flex items-center gap-1">
                    <span>{SOURCE_ICONS[ev.sourceType]}</span>
                    <span className="capitalize text-muted-foreground">{ev.sourceType}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      isOverdue(ev.dueDate, ev.status) ? "text-red-600" : "text-muted-foreground"
                    }`}
                  >
                    {ev.status === "collected" ? ev.dueDate : getDaysUntil(ev.dueDate)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${STATUS_COLORS[ev.status]}`}>
                    <span>{STATUS_ICONS[ev.status]}</span>
                    {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{ev.collector}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {ev.frameworks.map((f) => (
                      <span key={f} className="px-1.5 py-0.5 rounded text-xs bg-secondary text-secondary-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">No evidence found</p>
            <p className="text-sm mt-1">Upload or request evidence to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
