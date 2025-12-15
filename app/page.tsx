"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { HeadsUpDisplay } from "@/components/heads-up-display"
import { PriceChart } from "@/components/price-chart"
import { ProfitSimulator } from "@/components/profit-simulator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export type PredictionData = {
  ticker: string
  currentPrice: number
  targetPrice: number
  predictedChange: number
  signal: "BUY" | "SELL" | "HOLD" | "STRONG BUY" | "STRONG SELL"
  rsi: number
  macd: "Bullish" | "Bearish"
  volatility: "Low" | "Medium" | "High"
  historicalPrices: { date: string; price: number }[]
  predictedPrice: number
  forecastData: { day: number; price: number; changePct: number }[]
}

export default function QuantMindDashboard() {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(3)

  const fetchPrediction = async (ticker: string) => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction?ticker=${ticker}`
      )

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message ?? "Failed to fetch prediction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Command / Search */}
        <SearchBar onSearch={fetchPrediction} />

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-28 bg-slate-800/60" />
            <Skeleton className="h-96 bg-slate-800/60" />
          </div>
        )}

        {/* Main Content */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Decision summary */}
            <HeadsUpDisplay data={data} forecastDays={forecastDays} />

            {/* Chart + Tools */}
            <div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
              {/* Primary: Price & Forecast */}
              <PriceChart
                ticker={data.ticker}
                onForecastChange={setForecastDays}
              />

              {/* Secondary: Simulation */}
              <ProfitSimulator
                data={data}
                forecastDays={forecastDays}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <Card className="border border-dashed border-slate-800 bg-slate-900/40 p-8">
            <div className="text-center space-y-2">
              <p className="font-mono text-slate-300">
                Market intelligence ready
              </p>
              <p className="text-xs font-mono text-slate-500">
                Enter a ticker above to generate AI-powered forecasts and risk
                metrics
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
