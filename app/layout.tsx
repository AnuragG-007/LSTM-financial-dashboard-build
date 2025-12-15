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
      "AI-powered trade ideas, risk metrics, and professional-grade charts.",
    images: ["/og/dashboard-preview.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-slate-950 text-slate-50 antialiased">
        {/* Global background – restrained, terminal-like */}
        <div className="fixed inset-0 -z-10 bg-slate-950" />
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,_rgba(16,185,129,0.05),_transparent_30%)]" />

        {/* Top navigation / brand bar */}
        <header className="border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-400/40">
                <Activity className="h-4 w-4 text-emerald-400" />
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-slate-100">
                    QuantMind
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-emerald-400 border border-emerald-500/30">
                    Alpha
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-600">
                  Research-grade forecasting terminal
                </p>
              </div>
            </div>

            {/* System status */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Model: QMind-v1 • Latency &lt; 200ms</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-3rem)]">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/70 bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-[11px] font-mono text-slate-700">
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
