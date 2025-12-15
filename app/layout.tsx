import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Activity } from "lucide-react"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

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
}

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
            <div className="flex items-center gap-3">
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
            </div>

            {/* Status */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model: QMind-v1 • Latency &lt; 200ms</span>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-800/70 bg-slate-950/90">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Identity */}
              <div className="space-y-1 text-xs font-mono text-slate-500">
                <p className="text-slate-400">
                  Built by <span className="text-slate-300">Anurag Gaikwad</span>
                </p>
                <p>
                  QuantMind is a research and educational project focused on
                  AI-driven market forecasting.
                </p>
              </div>

              {/* Legal / Meta */}
              <div className="text-xs font-mono text-slate-500 text-left md:text-right">
                <p>© {new Date().getFullYear()} QuantMind Labs</p>
                <p className="mt-1 text-slate-600">
                  Not financial advice • For research & education only
                </p>
              </div>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  )
}
