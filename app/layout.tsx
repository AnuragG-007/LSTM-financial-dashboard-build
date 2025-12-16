import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Activity, Info, Mail, Github } from "lucide-react";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "QuantMind – AI-Powered Market Intelligence",
  description:
    "Research-grade trading terminal with AI-driven forecasts, technical indicators, and risk-aware confidence bands.",
  applicationName: "QuantMind",
  metadataBase: new URL("https://quantmind.app"),
  openGraph: {
    title: "QuantMind – AI Market Intelligence",
    description:
      "AI-powered stock and crypto forecasting terminal for research and education.",
    siteName: "QuantMind",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased">
        {/* Global background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
        <div className="fixed inset-0 -z-10 opacity-25 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)]" />

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            {/* Brand */}
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold tracking-wide text-slate-100">
                    QuantMind
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase text-emerald-400">
                    Alpha
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500">
                  Research-grade forecasting terminal
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Link
                href="/metrics-info"
                className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-1.5 text-xs font-mono text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800/50 hover:text-emerald-400 transition-all"
              >
                <Info className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Metrics Info</span>
              </Link>

              {/* Status */}
              <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-500 border-l border-slate-800 pl-3">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Model: QMind-v1 • Latency &lt; 200ms</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-slate-800/70 bg-slate-950/90">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="grid gap-8 md:grid-cols-3">
              {/* Identity */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-400" />
                  <span className="font-mono text-sm font-semibold text-slate-200">
                    QuantMind
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-500 leading-relaxed">
                  Research-grade AI-powered market forecasting terminal focused
                  on transparency, risk-awareness, and educational value.
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Contact
                </h3>
                <div className="space-y-2">
                  <a
                    href="mailto:anugaikwad157@gmail.com"
                    className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>anugaikwad157@gmail.com</span>
                  </a>
                  <a
                    href="https://github.com/AnuragG-007"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>github.com/AnuragG-007</span>
                  </a>
                </div>
              </div>

              {/* Legal / Meta */}
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                  About
                </h3>
                <div className="space-y-2 text-xs font-mono text-slate-500">
                  <p>
                    Built by{" "}
                    <span className="text-slate-300 font-semibold">
                      Anurag Gaikwad
                    </span>
                  </p>
                  <p>© {new Date().getFullYear()} QuantMind Labs</p>
                  <p className="text-slate-600 pt-2 border-t border-slate-800">
                    Not financial advice • For research & education only
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
              <p className="text-[10px] font-mono text-slate-600">
                This platform is for educational and research purposes only. All
                forecasts are probabilistic and should not be used as sole
                investment guidance.
              </p>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
