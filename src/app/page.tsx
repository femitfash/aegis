import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Aegis <span className="text-primary">GRC</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Copilot-first Governance, Risk & Compliance platform.
          <br />
          Manage security compliance through conversation, not forms.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Zero-Field Forms</h3>
            <p className="text-sm text-muted-foreground">
              Describe risks in natural language. AI extracts the data.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Copilot-First</h3>
            <p className="text-sm text-muted-foreground">
              Chat is the primary interface. Ask questions, take actions.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="font-semibold mb-2">Auditor Trust</h3>
            <p className="text-sm text-muted-foreground">
              Immutable audit logs with cryptographic verification.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
