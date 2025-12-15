import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "QuantMind – AI-Powered Market Intelligence",
  description:
    "Professional trading terminal with AI-powered stock predictions and market analysis.",
  generator: "v0.app",
  applicationName: "QuantMind",
  metadataBase: new URL("https://your-domain.com"),
  icons: {
    icon: [
      { url: "/icons/app-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/app-icon-apple.png",
  },
  openGraph: {
    title: "QuantMind – AI-Powered Market Intelligence",
    description:
      "Trade with confidence using QuantMind’s AI-driven forecasts and risk metrics.",
    url: "https://your-domain.com",
    siteName: "QuantMind",
    images: [
      {
        url: "/og/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "QuantMind dashboard preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuantMind – AI-Powered Market Intelligence",
    description:
      "AI-powered trade ideas, risk metrics, and beautiful charts in one terminal.",
    images: ["/og/dashboard-preview.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-slate-950 text-slate-50 antialiased">
        {/* Global background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />
        <div className="fixed inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_top,_#22c55e_0,_transparent_55%),_radial-gradient(circle_at_bottom,_#0ea5e9_0,_transparent_55%)]" />

        {/* Top brand bar */}
        <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Simple monogram logo */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-400/40">
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  QM
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-100">
                    QuantMind
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-emerald-400 border border-emerald-500/30">
                    Alpha Preview
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500">
                  AI-Powered Market Intelligence Terminal
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model: QMind-v1 • Latency &lt; 200ms</span>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-3.25rem)]">
          {children}
        </main>

        <footer className="border-t border-slate-900/80 bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[11px] font-mono text-slate-600">
            <span>© {new Date().getFullYear()} QuantMind Labs</span>
            <span className="hidden md:inline">
              Not financial advice. For research and educational use only.
            </span>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  )
}
