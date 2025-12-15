"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { HeadsUpDisplay } from "@/components/heads-up-display"
import { PriceChart } from "@/components/price-chart"
import { ProfitSimulator } from "@/components/profit-simulator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AlertCircle, BarChart3 } from "lucide-react"

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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* SEARCH */}
        <section>
          <SearchBar onSearch={fetchPrediction} />
        </section>

        {/* ERROR */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* LOADING */}
        {loading && (
          <section className="space-y-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-[420px] rounded-lg" />
          </section>
        )}

        {/* DATA VIEW */}
        {data && !loading && (
          <>
            {/* HEADS UP DISPLAY */}
            <section>
              <HeadsUpDisplay data={data} forecastDays={forecastDays} />
            </section>

            {/* ANALYSIS */}
            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PriceChart
                ticker={data.ticker}
                onForecastChange={setForecastDays}
              />
              <ProfitSimulator
                data={data}
                forecastDays={forecastDays}
              />
            </section>
          </>
        )}

        {/* EMPTY STATE */}
        {!data && !loading && !error && (
          <Card className="border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <BarChart3 className="h-6 w-6 text-slate-500" />
              <p className="font-mono text-sm text-slate-400">
                Enter a ticker to begin market analysis
              </p>
              <p className="font-mono text-xs text-slate-600">
                Stocks, ETFs, and crypto pairs supported
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
