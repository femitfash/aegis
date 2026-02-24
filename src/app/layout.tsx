import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis GRC - Governance, Risk & Compliance",
  description: "Copilot-first GRC platform for modern security teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: apply saved theme before first paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('aegis-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body
        className={inter.className}
        suppressHydrationWarning
        data-gramm="false"
        data-gramm_editor="false"
        data-lt-installed="false"
      >
        {children}
      </body>
    </html>
  );
}
