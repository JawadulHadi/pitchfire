import type { Metadata, Route } from "next";
import Link from "next/link";
import { Syne, Archivo, Instrument_Sans, Martian_Mono } from "next/font/google";
import "./globals.css";
import { LogoHorizontal } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const syne = Syne({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-syne",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-sans",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-martian-mono",
});

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

const NAV_LINKS: { label: string; href: Route }[] = [
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${archivo.variable} ${instrumentSans.variable} ${martianMono.variable}`}
    >
      <head>
        {/* FOUC prevention — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('pf-theme');var d=t?t==='dark':!window.matchMedia('(prefers-color-scheme: light)').matches;if(!d)document.documentElement.classList.add('light');})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <nav className="glass-nav px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            aria-label="PitchFire home"
            className="flex items-center gap-2.5"
          >
            <LogoHorizontal height={36} />
            <span className="eyebrow hidden sm:inline-block rounded-full border border-[var(--border)] px-2 py-0.5">
              v0.4
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <div
              className="hidden md:flex gap-5 text-sm font-medium"
              style={{ color: "var(--text-2)" }}
            >
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-[var(--text-1)] transition-colors"
                >
                  {l.label}
                </Link>
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
