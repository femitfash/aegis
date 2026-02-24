import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar with brand */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">Aegis</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
              GRC
            </span>
          </Link>
        </div>
      </header>

      {/* Centered auth form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          Aegis GRC Platform &mdash; Copilot-first Governance, Risk &amp;
          Compliance
        </div>
      </footer>
    </div>
  );
}
