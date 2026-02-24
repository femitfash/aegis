"use client";

import { useState } from "react";
import { useTheme } from "@/shared/hooks/useTheme";

type Tab = "organization" | "team" | "integrations" | "notifications" | "security" | "appearance";

const TEAM_MEMBERS = [
  { id: "1", name: "Alice Chen", email: "alice@example.com", role: "Compliance Manager", status: "active", lastActive: "2 hours ago", avatar: "AC" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Risk Owner", status: "active", lastActive: "1 day ago", avatar: "BS" },
  { id: "3", name: "Carlos Rivera", email: "carlos@example.com", role: "Risk Owner", status: "active", lastActive: "3 hours ago", avatar: "CR" },
  { id: "4", name: "Diana Lee", email: "diana@example.com", role: "Compliance Manager", status: "active", lastActive: "5 hours ago", avatar: "DL" },
  { id: "5", name: "Eve Johnson", email: "eve@example.com", role: "Viewer", status: "pending", lastActive: "Never", avatar: "EJ" },
];

const ROLES = ["Admin", "Compliance Manager", "Risk Owner", "Auditor", "Viewer"];

const INTEGRATIONS = [
  { id: "jira", name: "Jira", description: "Sync risks and controls as Jira issues", icon: "🔵", status: "connected", detail: "Connected to acme.atlassian.net" },
  { id: "slack", name: "Slack", description: "Get notifications and create items via Slack", icon: "💬", status: "connected", detail: "Connected to #grc-alerts" },
  { id: "github", name: "GitHub Actions", description: "Auto-collect evidence from CI/CD pipelines", icon: "⚙️", status: "available", detail: null },
  { id: "aws", name: "AWS Security Hub", description: "Import findings as risks automatically", icon: "☁️", status: "available", detail: null },
  { id: "azure", name: "Azure Defender", description: "Sync security alerts and compliance data", icon: "🔷", status: "available", detail: null },
  { id: "okta", name: "Okta", description: "Auto-collect access reviews and user activity", icon: "🔑", status: "available", detail: null },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const { theme, setTheme } = useTheme();
  const [orgName, setOrgName] = useState("Acme Corp");
  const [orgSlug, setOrgSlug] = useState("acme-corp");
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "organization", label: "Organization", icon: "🏢" },
    { id: "team", label: "Team", icon: "👥" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your organization and platform preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === "organization" && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h2 className="font-semibold mb-4">Organization Details</h2>
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Organization Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">aegis.app/</span>
                      <input
                        type="text"
                        value={orgSlug}
                        onChange={(e) => setOrgSlug(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Industry</label>
                    <select className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Technology / SaaS</option>
                      <option>Financial Services</option>
                      <option>Healthcare</option>
                      <option>Retail / E-commerce</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Size</label>
                    <select className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>1-50 employees</option>
                      <option>51-200 employees</option>
                      <option>201-1000 employees</option>
                      <option>1000+ employees</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      saved
                        ? "bg-green-600 text-white"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {saved ? "✅ Saved!" : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h2 className="font-semibold mb-2">Subscription</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                      Pro Plan
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      Unlimited risks, controls, and evidence · 10 team members · All frameworks
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-md border text-sm hover:bg-accent transition-colors">
                    Manage Billing
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Team Members</h2>
                  <span className="text-sm text-muted-foreground">{TEAM_MEMBERS.length} members</span>
                </div>

                {/* Invite form */}
                <div className="flex gap-2 mb-4 p-3 rounded-md bg-muted/30 border border-dashed">
                  <input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="px-3 py-2 rounded-md border bg-background text-sm focus:outline-none"
                  >
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap">
                    Send Invite
                  </button>
                </div>

                {/* Team table */}
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Member</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">Last Active</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {TEAM_MEMBERS.map((member) => (
                        <tr key={member.id} className="border-t hover:bg-accent/20">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                {member.avatar}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-xs bg-secondary">{member.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              member.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {member.status === "active" ? "Active" : "Pending invite"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{member.lastActive}</td>
                          <td className="px-4 py-3">
                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                <p className="text-sm text-primary">
                  <strong>Pro tip:</strong> Integrations automatically collect evidence and sync risk data, reducing manual effort by up to 70%.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {INTEGRATIONS.map((integration) => (
                  <div key={integration.id} className="p-5 rounded-lg border bg-card hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          {integration.detail && (
                            <p className="text-xs text-green-600">{integration.detail}</p>
                          )}
                        </div>
                      </div>
                      {integration.status === "connected" ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                          Connected
                        </span>
                      ) : (
                        <button className="px-3 py-1 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                          Connect
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-6 rounded-lg border bg-card">
              <h2 className="font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4 max-w-lg">
                {[
                  { label: "New risk registered", description: "When a risk is created in your org", defaultOn: true },
                  { label: "Risk score changes", description: "When a risk score increases or decreases", defaultOn: true },
                  { label: "Evidence overdue", description: "24 hours before evidence due date", defaultOn: true },
                  { label: "Compliance gap detected", description: "When a new framework gap is found", defaultOn: true },
                  { label: "Copilot actions approved/rejected", description: "When team members act on copilot suggestions", defaultOn: false },
                  { label: "Weekly digest", description: "Weekly summary of your GRC posture", defaultOn: true },
                ].map(({ label, description, defaultOn }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <button
                      className={`w-10 h-6 rounded-full transition-colors ${
                        defaultOn ? "bg-primary" : "bg-muted"
                      } relative`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          defaultOn ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg border bg-card">
                <h2 className="font-semibold mb-4">Authentication</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Multi-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Require MFA for all team members</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Enabled</span>
                      <button className="text-xs text-muted-foreground hover:text-foreground">Configure</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="font-medium text-sm">SSO / SAML</p>
                      <p className="text-xs text-muted-foreground">Single sign-on with your identity provider</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-md text-xs border hover:bg-accent transition-colors">
                      Configure SSO
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="font-medium text-sm">Session Timeout</p>
                      <p className="text-xs text-muted-foreground">Automatically log out idle sessions</p>
                    </div>
                    <select className="px-2 py-1 rounded-md border bg-background text-xs focus:outline-none">
                      <option>4 hours</option>
                      <option>8 hours</option>
                      <option>24 hours</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card">
                <h2 className="font-semibold mb-4">Audit Log</h2>
                <p className="text-sm text-muted-foreground mb-3">
                  All actions are recorded in an immutable audit log with cryptographic hash chain verification.
                </p>
                <div className="space-y-2">
                  {[
                    { action: "Risk created", user: "Alice Chen", time: "2 hours ago", detail: "RISK-012: S3 Public Access" },
                    { action: "Evidence uploaded", user: "Bob Smith", time: "5 hours ago", detail: "EVD-012: Q4 Access Review" },
                    { action: "Control status updated", user: "Carlos Rivera", time: "1 day ago", detail: "RA-05: Testing → Implemented" },
                    { action: "User invited", user: "Alice Chen", time: "2 days ago", detail: "eve@example.com as Viewer" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs py-2 border-b last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span className="font-medium w-36">{log.action}</span>
                      <span className="text-muted-foreground w-24">{log.user}</span>
                      <span className="text-muted-foreground flex-1">{log.detail}</span>
                      <span className="text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-sm text-primary hover:underline">
                  View full audit log →
                </button>
              </div>
            </div>
          )}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h2 className="font-semibold mb-1">Theme</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose how Aegis looks to you. System will match your OS preference.
                </p>
                <div className="flex gap-3">
                  {([
                    { value: "light", label: "Light", icon: "☀️", description: "Always light" },
                    { value: "system", label: "System", icon: "💻", description: "Match OS setting" },
                    { value: "dark", label: "Dark", icon: "🌙", description: "Always dark" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`flex-1 flex flex-col items-center gap-2 px-4 py-5 rounded-lg border-2 transition-colors ${
                        theme === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">{opt.description}</span>
                      {theme === opt.value && (
                        <span className="text-xs text-primary font-medium">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
