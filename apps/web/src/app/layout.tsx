import type { Metadata } from "next";
import { LogoHorizontal } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "PitchFire — Autonomous AI Job Search",
  description:
    "Upload your resume once. PitchFire discovers matched jobs, tailors every application, submits autonomously, tracks replies, and books your interviews.",
  openGraph: {
    title: "PitchFire — Autonomous AI Job Search Orchestrator",
    description: "7 agents. 0 excuses. Your job search, fully automated.",
    images: [{ url: "/brand/banner-github.svg", width: 1280, height: 640 }],
  },
  icons: { icon: "/brand/logo-icon.svg" },
};

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jobs", href: "/jobs" },
  { label: "Review", href: "/review" },
  { label: "Applications", href: "/applications" },
  { label: "Sessions", href: "/sessions" },
  { label: "Analytics", href: "/analytics" },
  { label: "Billing", href: "/billing" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap"
          rel="stylesheet"
        />
        {/* FOUC prevention — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('pf-theme');var d=t?t==='dark':!window.matchMedia('(prefers-color-scheme: light)').matches;if(!d)document.documentElement.classList.add('light');})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <nav className="glass-nav px-6 py-3 flex items-center justify-between">
          <a href="/" aria-label="PitchFire home">
            <LogoHorizontal height={36} />
          </a>
          <div className="flex items-center gap-5">
            <div
              className="hidden md:flex gap-5 text-sm"
              style={{ color: "var(--text-2)" }}
            >
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="hover:text-[var(--text-1)] transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
