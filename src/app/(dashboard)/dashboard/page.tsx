import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here&apos;s your GRC posture at a glance.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Risks"
          value="24"
          change="+3 this week"
          trend="up"
          icon="⚠️"
        />
        <StatCard
          title="Critical Risks"
          value="5"
          change="-2 this week"
          trend="down"
          icon="🔴"
        />
        <StatCard
          title="Active Controls"
          value="156"
          change="89% effective"
          trend="neutral"
          icon="🛡️"
        />
        <StatCard
          title="SOC 2 Readiness"
          value="78%"
          change="+5% this month"
          trend="up"
          icon="✅"
        />
      </div>

      {/* Framework Progress */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Compliance Frameworks</h2>
        <div className="grid grid-cols-3 gap-4">
          <FrameworkCard name="SOC 2 Type II" progress={78} controls={60} implemented={47} color="blue" />
          <FrameworkCard name="ISO 27001:2022" progress={65} controls={93} implemented={60} color="purple" />
          <FrameworkCard name="NIST CSF" progress={71} controls={108} implemented={77} color="green" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-3">
          <QuickAction icon="⚠️" label="Register Risk" href="/dashboard/risks" />
          <QuickAction icon="📁" label="Upload Evidence" href="/dashboard/evidence" />
          <QuickAction icon="🛡️" label="Map Control" href="/dashboard/controls" />
          <QuickAction icon="📋" label="View Frameworks" href="/dashboard/frameworks" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Risks</h2>
            <Link href="/dashboard/risks" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            <RiskItem title="S3 Public Access Exposure" score={20} status="identified" id="RISK-001" />
            <RiskItem title="Outdated SSL Certificates" score={15} status="assessed" id="RISK-002" />
            <RiskItem title="Missing MFA on Admin Accounts" score={12} status="mitigated" id="RISK-003" />
            <RiskItem title="Unpatched Production Systems" score={16} status="identified" id="RISK-004" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Evidence</h2>
            <Link href="/dashboard/evidence" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            <EvidenceItem title="Q4 Access Review" control="AC-001" dueIn="3 days" overdue={false} />
            <EvidenceItem title="Penetration Test Report" control="RA-005" dueIn="1 week" overdue={false} />
            <EvidenceItem title="Security Training Records" control="AT-002" dueIn="2 weeks" overdue={false} />
            <EvidenceItem title="Vendor Risk Assessment" control="VR-003" dueIn="2 days ago" overdue={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
}) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p
        className={`text-sm mt-2 ${
          trend === "up"
            ? "text-green-600"
            : trend === "down"
            ? "text-red-600"
            : "text-muted-foreground"
        }`}
      >
        {trend === "up" ? "↑" : trend === "down" ? "↓" : ""} {change}
      </p>
    </div>
  );
}

function FrameworkCard({
  name,
  progress,
  controls,
  implemented,
  color,
}: {
  name: string;
  progress: number;
  controls: number;
  implemented: number;
  color: "blue" | "purple" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };

  return (
    <div className="p-5 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{name}</h3>
        <span className="text-2xl font-bold">{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${colorClasses[color]}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {implemented} of {controls} controls implemented
      </p>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-md border bg-card hover:bg-accent transition-colors"
    >
      <span>{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function RiskItem({
  title,
  score,
  status,
  id,
}: {
  title: string;
  score: number;
  status: string;
  id: string;
}) {
  const scoreClass =
    score >= 20
      ? "bg-red-100 text-red-700"
      : score >= 15
      ? "bg-orange-100 text-orange-700"
      : score >= 10
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  const statusColors: Record<string, string> = {
    identified: "text-red-600",
    assessed: "text-orange-600",
    mitigated: "text-green-600",
    accepted: "text-blue-600",
    closed: "text-muted-foreground",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className={`text-xs capitalize ${statusColors[status] || "text-muted-foreground"}`}>
          {id} · {status}
        </p>
      </div>
      <span className={`px-2 py-1 rounded text-sm font-bold ${scoreClass}`}>{score}</span>
    </div>
  );
}

function EvidenceItem({
  title,
  control,
  dueIn,
  overdue,
}: {
  title: string;
  control: string;
  dueIn: string;
  overdue: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">Control: {control}</p>
      </div>
      <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-orange-600"}`}>
        {overdue ? "⚠ " : ""}Due {dueIn}
      </span>
    </div>
  );
}
