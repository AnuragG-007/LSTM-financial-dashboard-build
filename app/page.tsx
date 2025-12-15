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
}

export default function QuantMindDashboard() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(3)

  // TODO: replace this mock with a real backend call
  const fetchPrediction = async (ticker: string) => {
    setLoading(true)
    setError(null)
    setPredictionData(null)

    try {
      // simulate latency
      await new Promise((resolve) => setTimeout(resolve, 800))

      const basePrice = Math.random() * 500 + 50
      const changePercent = Math.random() * 8 - 2 // -2% to +6%
      const targetPrice = basePrice * (1 + changePercent / 100)

      const historicalPrices = Array.from({ length: 60 }, (_, i) => {
        const variance = Math.random() * 0.1 - 0.05
        const price = basePrice * (1 + variance)
        const date = new Date()
        date.setDate(date.getDate() - (60 - i))

        return {
          date: date.toISOString().split("T")[0],
          price: Math.round(price * 100) / 100,
        }
      })

      const forecastData = Array.from({ length: 7 }, (_, i) => {
        const day = i + 1
        const dayProgress = day / 7
        const price = basePrice + (targetPrice - basePrice) * dayProgress
        const changePct = ((price - basePrice) / basePrice) * 100

        return {
          day,
          price: Math.round(price * 100) / 100,
          changePct,
        }
      })

      const mockData: PredictionData = {
        ticker: ticker.toUpperCase(),
        currentPrice: Math.round(basePrice * 100) / 100,
        targetPrice: Math.round(targetPrice * 100) / 100,
        predictedChange: changePercent,
        signal:
          changePercent > 1
            ? "STRONG BUY"
            : changePercent > 0
            ? "BUY"
            : changePercent < -1
            ? "STRONG SELL"
            : changePercent < 0
            ? "SELL"
            : "HOLD",
        rsi: Math.random() * 100,
        macd: Math.random() > 0.5 ? "Bullish" : "Bearish",
        volatility:
          Math.random() > 0.66
            ? "High"
            : Math.random() > 0.33
            ? "Medium"
            : "Low",
        historicalPrices,
        predictedPrice: Math.round(targetPrice * 100) / 100,
        forecastData,
      }

      setPredictionData(mockData)
      setForecastDays(3)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch prediction. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-mono font-semibold text-slate-100">
            QuantMind • AI-Powered Market Intelligence
          </h1>
          <p className="text-sm text-slate-500 font-mono">
            Our AI analyzes market data and forecasts short-term moves for any ticker.
          </p>
        </header>

        <SearchBar onSearch={fetchPrediction} />

        {error && (
          <Alert variant="destructive" className="bg-rose-950/60 border-rose-800 text-rose-100">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full bg-slate-900/60" />
            <Skeleton className="h-80 w-full bg-slate-900/60" />
            <Skeleton className="h-48 w-full bg-slate-900/60" />
          </div>
        )}

        {predictionData && !loading && (
          <div className="space-y-6">
            <HeadsUpDisplay data={predictionData} forecastDays={forecastDays} />
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <PriceChart
                data={predictionData}
                loading={loading}
                onForecastChange={setForecastDays}
              />
              <ProfitSimulator
                data={predictionData}
                forecastDays={forecastDays}
              />
            </div>
          </div>
        )}

        {!predictionData && !loading && !error && (
          <Card className="bg-slate-900/60 border-slate-800 p-6">
            <p className="text-sm text-slate-400 font-mono">
              Enter a ticker symbol above to begin analysis. QuantMind will fetch market
              data, compute AI predictions, and visualize the next few trading days.
            </p>
          </Card>
        )}
      </div>
    </main>
  )
}
