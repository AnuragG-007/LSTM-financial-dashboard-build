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
  macd: string
  volatility: "Low" | "Medium" | "High"
  historicalPrices: Array<{ date: string; price: number }>
  predictedPrice: number
  forecastData: Array<{ day: number; price: number; changePct: number }>
  chart: {
    points: Array<{
      date: string
      price: number
      lower: number
      upper: number
    }>
  }
}

export default function QuantMindDashboard() {
  const [data, setData] = useState<PredictionData | null>(null)
  const [ticker, setTicker] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrediction = async (t: string, days = forecastDays) => {
    setLoading(true)
    setError(null)
    setTicker(t)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/prediction/full?ticker=${encodeURIComponent(
          t,
        )}&days=${days}`,
      )

      if (!res.ok) {
        throw new Error(`API error ${res.status}`)
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch")
    } finally {
      setLoading(false)
    }
  }

  const handleForecastChange = (days: number) => {
    setForecastDays(days)
    if (ticker) {
      fetchPrediction(ticker, days)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <SearchBar onSearch={(t) => fetchPrediction(t, forecastDays)} />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        )}

        {data && !loading && (
          <>
            <HeadsUpDisplay data={data} forecastDays={forecastDays} />
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PriceChart
                data={data}
                forecastDays={forecastDays}
                onForecastChange={handleForecastChange}
              />
              <ProfitSimulator data={data} forecastDays={forecastDays} />
            </div>
          </>
        )}

        {!data && !loading && !error && (
          <Card className="p-6">
            Enter a ticker to begin analysis.
          </Card>
        )}
      </div>
    </main>
  )
}
