"use client";

import { useState, useEffect, useCallback } from "react";

type ReqStatus = "implemented" | "partial" | "not-started" | "not-applicable";

interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  domain: string;
  status: ReqStatus;
  controls: string[];
  evidence: number;
  evidenceRequired: number;
}

interface FrameworkDefinition {
  code: string;
  name: string;
  version: string;
  description: string;
  color: "blue" | "purple" | "green" | "gray";
  domains: Record<string, { requirements: FrameworkRequirement[] }>;
}

interface Framework extends FrameworkDefinition {
  readiness: number;
  totalRequirements: number;
  implemented: number;
  partial: number;
  notStarted: number;
  domainReadiness: Record<string, number>;
}

// Compute stats dynamically from requirement data (not hardcoded)
function computeStats(def: FrameworkDefinition): Framework {
  const allReqs = Object.values(def.domains).flatMap((d) => d.requirements);
  const implemented = allReqs.filter((r) => r.status === "implemented").length;
  const partial = allReqs.filter((r) => r.status === "partial").length;
  const notStarted = allReqs.filter((r) => r.status === "not-started").length;
  const total = allReqs.length;
  const readiness =
    total > 0 ? Math.round(((implemented + partial * 0.5) / total) * 100) : 0;

  const domainReadiness = Object.fromEntries(
    Object.entries(def.domains).map(([name, domain]) => {
      const imp = domain.requirements.filter((r) => r.status === "implemented").length;
      const par = domain.requirements.filter((r) => r.status === "partial").length;
      const tot = domain.requirements.length;
      return [name, tot > 0 ? Math.round(((imp + par * 0.5) / tot) * 100) : 0];
    })
  );

  return { ...def, readiness, totalRequirements: total, implemented, partial, notStarted, domainReadiness };
}

function applyOverrides(
  def: FrameworkDefinition,
  overrides: Record<string, string>
): Framework {
  const overriddenDomains = Object.fromEntries(
    Object.entries(def.domains).map(([domainName, domain]) => [
      domainName,
      {
        requirements: domain.requirements.map((req) => ({
          ...req,
          status: (overrides[`${def.code}::${req.code}`] as ReqStatus) || req.status,
        })),
      },
    ])
  );
  return computeStats({ ...def, domains: overriddenDomains });
}

const STATUS_CYCLE: ReqStatus[] = ["not-started", "partial", "implemented"];

function cycleStatus(current: ReqStatus): ReqStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return idx === -1 ? "partial" : STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// Built-in framework requirement definitions
const BUILTIN_FRAMEWORKS: FrameworkDefinition[] = [
  {
    code: "SOC2",
    name: "SOC 2 Type II",
    version: "2017",
    description:
      "Trust Services Criteria for security, availability, processing integrity, confidentiality, and privacy.",
    color: "blue",
    domains: {
      "Security (CC)": {
        requirements: [
          { id: "cc1.1", code: "CC1.1", title: "COSO Principle 1 - Commitment to Integrity", domain: "Security (CC)", status: "implemented", controls: ["AC-01", "IR-01"], evidence: 2, evidenceRequired: 2 },
          { id: "cc1.2", code: "CC1.2", title: "Board Independence and Oversight", domain: "Security (CC)", status: "implemented", controls: ["RA-03"], evidence: 1, evidenceRequired: 1 },
          { id: "cc6.1", code: "CC6.1", title: "Logical Access Controls - Infrastructure", domain: "Security (CC)", status: "implemented", controls: ["AC-03", "IA-02"], evidence: 3, evidenceRequired: 3 },
          { id: "cc6.7", code: "CC6.7", title: "Logical Access Restriction and Segmentation", domain: "Security (CC)", status: "partial", controls: ["AC-06"], evidence: 1, evidenceRequired: 2 },
          { id: "cc7.1", code: "CC7.1", title: "System Monitoring", domain: "Security (CC)", status: "implemented", controls: ["AU-02", "AU-06"], evidence: 2, evidenceRequired: 2 },
          { id: "cc9.2", code: "CC9.2", title: "Vendor and Business Partner Risk Management", domain: "Security (CC)", status: "not-started", controls: [], evidence: 0, evidenceRequired: 2 },
        ],
      },
      "Availability (A)": {
        requirements: [
          { id: "a1.1", code: "A1.1", title: "Capacity Management", domain: "Availability (A)", status: "implemented", controls: ["CM-02"], evidence: 2, evidenceRequired: 2 },
          { id: "a1.2", code: "A1.2", title: "Environmental Protections", domain: "Availability (A)", status: "partial", controls: [], evidence: 0, evidenceRequired: 1 },
          { id: "a1.3", code: "A1.3", title: "Recovery and Restoration", domain: "Availability (A)", status: "implemented", controls: ["IR-04"], evidence: 1, evidenceRequired: 1 },
        ],
      },
      "Confidentiality (C)": {
        requirements: [
          { id: "c1.1", code: "C1.1", title: "Identification of Confidential Information", domain: "Confidentiality (C)", status: "implemented", controls: ["AC-01"], evidence: 1, evidenceRequired: 1 },
          { id: "c1.2", code: "C1.2", title: "Disposal of Confidential Information", domain: "Confidentiality (C)", status: "implemented", controls: ["SC-08"], evidence: 1, evidenceRequired: 1 },
        ],
      },
    },
  },
  {
    code: "ISO27001",
    name: "ISO 27001:2022",
    version: "2022",
    description: "International standard for information security management systems (ISMS).",
    color: "purple",
    domains: {
      "A.5 Organizational Controls": {
        requirements: [
          { id: "a5.1", code: "A.5.1", title: "Policies for information security", domain: "A.5 Organizational Controls", status: "implemented", controls: ["AC-01", "IR-01"], evidence: 2, evidenceRequired: 2 },
          { id: "a5.15", code: "A.5.15", title: "Access control", domain: "A.5 Organizational Controls", status: "implemented", controls: ["AC-03"], evidence: 2, evidenceRequired: 2 },
          { id: "a5.23", code: "A.5.23", title: "Information security for use of cloud services", domain: "A.5 Organizational Controls", status: "not-started", controls: [], evidence: 0, evidenceRequired: 2 },
        ],
      },
      "A.6 People Controls": {
        requirements: [
          { id: "a6.1", code: "A.6.1", title: "Screening", domain: "A.6 People Controls", status: "implemented", controls: ["AT-01"], evidence: 1, evidenceRequired: 1 },
          { id: "a6.3", code: "A.6.3", title: "Information security awareness", domain: "A.6 People Controls", status: "implemented", controls: ["AT-02"], evidence: 2, evidenceRequired: 2 },
        ],
      },
      "A.8 Technological Controls": {
        requirements: [
          { id: "a8.5", code: "A.8.5", title: "Secure authentication", domain: "A.8 Technological Controls", status: "implemented", controls: ["IA-02", "IA-05"], evidence: 2, evidenceRequired: 2 },
          { id: "a8.16", code: "A.8.16", title: "Monitoring activities", domain: "A.8 Technological Controls", status: "partial", controls: ["AU-02"], evidence: 1, evidenceRequired: 2 },
          { id: "a8.28", code: "A.8.28", title: "Secure coding", domain: "A.8 Technological Controls", status: "not-started", controls: [], evidence: 0, evidenceRequired: 1 },
        ],
      },
    },
  },
  {
    code: "NIST_CSF",
    name: "NIST CSF v2.0",
    version: "2.0",
    description:
      "Framework for improving critical infrastructure cybersecurity with five core functions.",
    color: "green",
    domains: {
      "Identify (ID)": {
        requirements: [
          { id: "id.am", code: "ID.AM", title: "Asset Management", domain: "Identify (ID)", status: "implemented", controls: ["CM-02"], evidence: 2, evidenceRequired: 2 },
          { id: "id.gv", code: "ID.GV", title: "Governance", domain: "Identify (ID)", status: "implemented", controls: ["RA-03", "AC-01"], evidence: 2, evidenceRequired: 2 },
          { id: "id.ra", code: "ID.RA", title: "Risk Assessment", domain: "Identify (ID)", status: "implemented", controls: ["RA-03", "RA-05"], evidence: 2, evidenceRequired: 2 },
        ],
      },
      "Protect (PR)": {
        requirements: [
          { id: "pr.ac", code: "PR.AC", title: "Identity Management & Access Control", domain: "Protect (PR)", status: "implemented", controls: ["AC-02", "IA-02"], evidence: 3, evidenceRequired: 3 },
          { id: "pr.ac5", code: "PR.AC-5", title: "Network Integrity Protection", domain: "Protect (PR)", status: "partial", controls: ["SC-07"], evidence: 1, evidenceRequired: 2 },
          { id: "pr.ds", code: "PR.DS", title: "Data Security", domain: "Protect (PR)", status: "implemented", controls: ["SC-08"], evidence: 2, evidenceRequired: 2 },
        ],
      },
      "Detect (DE)": {
        requirements: [
          { id: "de.ae", code: "DE.AE", title: "Anomalies and Events", domain: "Detect (DE)", status: "implemented", controls: ["AU-02", "AU-06"], evidence: 2, evidenceRequired: 2 },
          { id: "de.cm4", code: "DE.CM-4", title: "Malicious Code Detection", domain: "Detect (DE)", status: "partial", controls: ["SI-03"], evidence: 1, evidenceRequired: 2 },
        ],
      },
    },
  },
];

const BUILTIN_CODES = new Set(BUILTIN_FRAMEWORKS.map((f) => f.code));

const STATUS_COLORS: Record<string, string> = {
  implemented: "bg-green-100 text-green-700 hover:bg-green-200",
  partial: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  "not-started": "bg-gray-100 text-gray-600 hover:bg-gray-200",
  "not-applicable": "bg-slate-100 text-slate-500",
};

const STATUS_ICONS: Record<string, string> = {
  implemented: "✅",
  partial: "⚡",
  "not-started": "○",
  "not-applicable": "—",
};

const FRAMEWORK_COLORS: Record<string, { card: string; progress: string; badge: string }> = {
  blue: { card: "border-blue-200 bg-blue-50/30", progress: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  purple: { card: "border-purple-200 bg-purple-50/30", progress: "bg-purple-500", badge: "bg-purple-100 text-purple-700" },
  green: { card: "border-green-200 bg-green-50/30", progress: "bg-green-500", badge: "bg-green-100 text-green-700" },
  gray: { card: "border-gray-200 bg-gray-50/30", progress: "bg-gray-400", badge: "bg-gray-100 text-gray-700" },
};

// Raw type for custom requirements from the DB (no status — that comes from overrides)
type CustomReqRaw = Omit<FrameworkRequirement, "status">;

export default function FrameworksPage() {
  const [selectedFrameworkCode, setSelectedFrameworkCode] = useState<string | null>(null);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [customDefs, setCustomDefs] = useState<FrameworkDefinition[]>([]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load frameworks, custom requirements, and status overrides in parallel
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fwRes, statusRes, reqRes] = await Promise.all([
        fetch("/api/frameworks"),
        fetch("/api/frameworks/status"),
        fetch("/api/frameworks/requirements"),
      ]);

      // Build custom requirements map: { HIPAA: { "Privacy Rule": [rawReq, ...] } }
      let customReqMap: Record<string, Record<string, CustomReqRaw[]>> = {};
      if (reqRes.ok) {
        const { custom_requirements } = await reqRes.json();
        customReqMap = custom_requirements || {};
      }

      if (fwRes.ok) {
        const { frameworks } = await fwRes.json();
        const custom: FrameworkDefinition[] = (frameworks || [])
          .filter((fw: { code: string }) => !BUILTIN_CODES.has(fw.code))
          .map((fw: { code: string; name: string; version: string; description: string }) => {
            // Build domains from custom requirements stored in settings
            const fwReqs = customReqMap[fw.code] || {};
            const domains: Record<string, { requirements: FrameworkRequirement[] }> = {};
            for (const [domainName, reqs] of Object.entries(fwReqs)) {
              domains[domainName] = {
                requirements: (reqs as CustomReqRaw[]).map((r) => ({
                  ...r,
                  status: "not-started" as ReqStatus, // status applied later by applyOverrides
                })),
              };
            }
            return {
              code: fw.code,
              name: fw.name,
              version: fw.version || "1.0",
              description: fw.description || "",
              color: "gray" as const,
              domains,
            };
          });
        setCustomDefs(custom);
      }

      if (statusRes.ok) {
        const { requirement_statuses } = await statusRes.json();
        setStatusOverrides(requirement_statuses || {});
      }
    } catch (error) {
      console.error("Failed to fetch frameworks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Refresh when copilot creates a framework, requirement, or updates a requirement status
  useEffect(() => {
    const handler = () => fetchAll();
    window.addEventListener("grc:framework-created", handler);
    window.addEventListener("grc:requirement-created", handler);
    window.addEventListener("grc:requirement-status-updated", handler);
    return () => {
      window.removeEventListener("grc:framework-created", handler);
      window.removeEventListener("grc:requirement-created", handler);
      window.removeEventListener("grc:requirement-status-updated", handler);
    };
  }, [fetchAll]);

  const allDefs: FrameworkDefinition[] = [...BUILTIN_FRAMEWORKS, ...customDefs];
  const allFrameworks: Framework[] = allDefs.map((def) => applyOverrides(def, statusOverrides));

  const selectedFramework = selectedFrameworkCode
    ? allFrameworks.find((fw) => fw.code === selectedFrameworkCode) ?? null
    : null;

  const avgReadiness =
    allFrameworks.length > 0
      ? Math.round(allFrameworks.reduce((s, fw) => s + fw.readiness, 0) / allFrameworks.length)
      : 0;

  const handleStatusChange = useCallback(
    async (frameworkCode: string, reqCode: string, newStatus: ReqStatus) => {
      const key = `${frameworkCode}::${reqCode}`;
      const prevStatus = statusOverrides[key];
      // Optimistic update
      setStatusOverrides((prev) => ({ ...prev, [key]: newStatus }));
      try {
        await fetch("/api/frameworks/status", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, status: newStatus }),
        });
      } catch {
        // Revert on failure
        setStatusOverrides((prev) => {
          const next = { ...prev };
          if (prevStatus) next[key] = prevStatus;
          else delete next[key];
          return next;
        });
      }
    },
    [statusOverrides]
  );

  if (selectedFramework) {
    const isCustom = !BUILTIN_CODES.has(selectedFramework.code);
    return (
      <FrameworkDetail
        framework={selectedFramework}
        isCustom={isCustom}
        expandedDomain={expandedDomain}
        onToggleDomain={setExpandedDomain}
        onBack={() => { setSelectedFrameworkCode(null); setExpandedDomain(null); }}
        onStatusChange={(reqCode, newStatus) =>
          handleStatusChange(selectedFramework.code, reqCode, newStatus)
        }
        onRequirementAdded={fetchAll}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compliance Frameworks</h1>
          <p className="text-muted-foreground mt-1">
            Track your compliance posture across all active frameworks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="px-3 py-2 rounded-md border text-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading ? "⟳" : "↻"} Refresh
          </button>
          <button
            className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => {
              const input = document.querySelector<HTMLInputElement>(
                '[placeholder="Ask anything about GRC..."]'
              );
              if (input) {
                input.value = "Add a new compliance framework: ";
                input.focus();
              }
            }}
          >
            + Add Framework
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="p-5 rounded-lg border bg-card mb-6">
        <h2 className="font-semibold mb-4">Overall Compliance Score</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">
              {loading ? <span className="text-3xl text-muted-foreground">—</span> : `${avgReadiness}%`}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Avg. Readiness</p>
          </div>
          <div className="flex-1 space-y-3">
            {allFrameworks.map((fw) => {
              const colors = FRAMEWORK_COLORS[fw.color];
              return (
                <div key={fw.code} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-32">{fw.name.split(" ").slice(0, 2).join(" ")}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${colors.progress} transition-all`} style={{ width: `${fw.readiness}%` }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right">{fw.readiness}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-3 gap-6">
        {allFrameworks.map((fw) => {
          const colors = FRAMEWORK_COLORS[fw.color];
          const gaps = fw.notStarted + fw.partial;
          return (
            <div
              key={fw.code}
              className={`p-6 rounded-xl border-2 ${colors.card} cursor-pointer hover:shadow-md transition-all`}
              onClick={() => setSelectedFrameworkCode(fw.code)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>{fw.code}</span>
                  <h3 className="font-bold text-lg mt-2">{fw.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">v{fw.version}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{fw.readiness}%</div>
                  <div className="text-xs text-muted-foreground">ready</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{fw.description}</p>
              <div className="w-full bg-white/60 rounded-full h-2.5 mb-4">
                <div className={`h-2.5 rounded-full ${colors.progress}`} style={{ width: `${fw.readiness}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-600">{fw.implemented}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-lg font-bold text-yellow-600">{fw.partial}</div>
                  <div className="text-xs text-muted-foreground">Partial</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-lg font-bold text-gray-500">{fw.notStarted}</div>
                  <div className="text-xs text-muted-foreground">Gaps</div>
                </div>
              </div>
              {fw.totalRequirements > 0 ? (
                <p className="mt-3 text-xs text-center text-muted-foreground">
                  {fw.implemented}/{fw.totalRequirements} requirements met
                  {gaps > 0 && ` · ${gaps} need attention`}
                </p>
              ) : (
                <p className="mt-3 text-xs text-center text-muted-foreground italic">
                  No requirements defined yet · click to add
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FrameworkDetail({
  framework,
  isCustom,
  expandedDomain,
  onToggleDomain,
  onBack,
  onStatusChange,
  onRequirementAdded,
}: {
  framework: Framework;
  isCustom: boolean;
  expandedDomain: string | null;
  onToggleDomain: (domain: string | null) => void;
  onBack: () => void;
  onStatusChange: (reqCode: string, newStatus: ReqStatus) => void;
  onRequirementAdded: () => void;
}) {
  const colors = FRAMEWORK_COLORS[framework.color];
  const allRequirements = Object.values(framework.domains).flatMap((d) => d.requirements);
  const gaps = allRequirements.filter(
    (r) => r.status !== "implemented" && r.status !== "not-applicable"
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [newReq, setNewReq] = useState({
    code: "",
    title: "",
    domain: "",
    evidence_required: "1",
  });

  const handleAddRequirement = async () => {
    if (!newReq.title.trim()) {
      setAddError("Title is required");
      return;
    }
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/frameworks/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          framework_code: framework.code,
          domain: newReq.domain || "General",
          code: newReq.code,
          title: newReq.title,
          evidence_required: Number(newReq.evidence_required) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add requirement");
      setNewReq({ code: "", title: "", domain: "", evidence_required: "1" });
      setShowAddForm(false);
      onRequirementAdded();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add requirement");
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground">
          ← Back
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>{framework.code}</span>
            <h1 className="text-2xl font-bold">{framework.name}</h1>
            {isCustom && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">Custom</span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">{framework.description}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {isCustom && (
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
            >
              {showAddForm ? "✕ Cancel" : "+ Add Requirement"}
            </button>
          )}
          <div className="text-right">
            <div className="text-4xl font-bold">{framework.readiness}%</div>
            <div className="text-xs text-muted-foreground">Overall Readiness</div>
          </div>
        </div>
      </div>

      {/* Add Requirement Form (custom frameworks only) */}
      {isCustom && showAddForm && (
        <div className="mb-6 p-5 rounded-xl border bg-card shadow-sm">
          <h3 className="font-semibold text-sm mb-4">Add Requirement to {framework.name}</h3>
          {addError && (
            <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">{addError}</p>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newReq.title}
                onChange={(e) => setNewReq((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Access Control to ePHI"
                className="w-full px-3 py-2 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Domain / Category
              </label>
              <input
                type="text"
                value={newReq.domain}
                onChange={(e) => setNewReq((p) => ({ ...p, domain: e.target.value }))}
                placeholder="e.g. Security Rule, Privacy Rule"
                className="w-full px-3 py-2 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Code (optional)
              </label>
              <input
                type="text"
                value={newReq.code}
                onChange={(e) => setNewReq((p) => ({ ...p, code: e.target.value }))}
                placeholder="e.g. 164.312(a)"
                className="w-full px-3 py-2 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Evidence Required
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={newReq.evidence_required}
                onChange={(e) => setNewReq((p) => ({ ...p, evidence_required: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRequirement}
              disabled={addLoading || !newReq.title.trim()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {addLoading ? "Adding..." : "Add Requirement"}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setAddError(""); }}
              className="px-4 py-2 rounded-md border text-sm hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 You can also add requirements via the copilot: &quot;Add a HIPAA requirement for access control to ePHI&quot;
          </p>
        </div>
      )}

      {/* Summary stats — computed from real requirement data */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Implemented", value: framework.implemented, color: "text-green-600" },
          { label: "Partial", value: framework.partial, color: "text-yellow-600" },
          { label: "Not Started", value: framework.notStarted, color: "text-gray-500" },
          { label: "Gaps", value: gaps.length, color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-lg border bg-card">
            <p className="text-xs text-muted-foreground uppercase">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {Object.keys(framework.domains).length === 0 ? (
        <div className="py-16 text-center text-muted-foreground rounded-lg border bg-card">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium">No requirements defined</p>
          <p className="text-sm mt-2">
            {isCustom ? (
              <>
                Add requirements using the <strong>+ Add Requirement</strong> button above,
                <br />or ask the copilot: <em>&quot;Add a {framework.code} requirement for access control&quot;</em>
              </>
            ) : (
              "Requirements for this framework haven't been configured yet."
            )}
          </p>
          {isCustom && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + Add First Requirement
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Click a status badge to cycle it: Not Started → Partial → Implemented
          </p>
          <div className="space-y-3">
            {Object.entries(framework.domains).map(([domainName, domain]) => {
              const isExpanded = expandedDomain === domainName;
              const domainGaps = domain.requirements.filter(
                (r) => r.status !== "implemented" && r.status !== "not-applicable"
              );
              const domainReadiness = framework.domainReadiness[domainName] ?? 0;

              return (
                <div key={domainName} className="rounded-lg border bg-card overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors text-left"
                    onClick={() => onToggleDomain(isExpanded ? null : domainName)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{domainName}</span>
                      {domainGaps.length > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          {domainGaps.length} gap{domainGaps.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-bold">{domainReadiness}%</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({domain.requirements.filter((r) => r.status === "implemented").length}/{domain.requirements.length})
                        </span>
                      </div>
                      <div className="w-24 bg-muted rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${colors.progress}`} style={{ width: `${domainReadiness}%` }} />
                      </div>
                      <span className="text-muted-foreground">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/20">
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground w-20">Code</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Requirement</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Controls</th>
                            <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Evidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {domain.requirements.map((req) => (
                            <tr key={req.id} className="border-t hover:bg-accent/20">
                              <td className="px-4 py-3 font-mono text-xs font-semibold">{req.code}</td>
                              <td className="px-4 py-3 font-medium">{req.title}</td>
                              <td className="px-4 py-3">
                                {req.status === "not-applicable" ? (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                    — N/A
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => onStatusChange(req.code, cycleStatus(req.status))}
                                    title="Click to cycle status"
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 w-fit transition-colors cursor-pointer ${STATUS_COLORS[req.status]}`}
                                  >
                                    <span>{STATUS_ICONS[req.status]}</span>
                                    {req.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 flex-wrap">
                                  {req.controls.length > 0 ? (
                                    req.controls.map((c) => (
                                      <span key={c} className="px-1.5 py-0.5 rounded text-xs bg-secondary font-mono">{c}</span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">None mapped</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium ${req.evidence >= req.evidenceRequired ? "text-green-600" : "text-orange-600"}`}>
                                  {req.evidence}/{req.evidenceRequired}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
