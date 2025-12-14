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
  forecastData: Array<{ day: number; price: number }>
}

export default function QuantMindDashboard() {
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(3)

  const fetchPrediction = async (ticker: string) => {
    setLoading(true)
    setError(null)
    setPredictionData(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const basePrice = Math.random() * 500 + 50
      const changePercent = Math.random() * 8 - 2 // -2% to +6%
      const targetPrice = basePrice * (1 + changePercent / 100)

      const historicalPrices = Array.from({ length: 60 }, (_, i) => {
        const variance = Math.random() * 0.1 - 0.05 // ±5% variance
        const price = basePrice * (1 + variance)
        const date = new Date()
        date.setDate(date.getDate() - (60 - i))
        return {
          date: date.toISOString().split("T")[0],
          price: Math.round(price * 100) / 100,
        }
      })

      const forecastData = Array.from({ length: 7 }, (_, i) => {
        const dayProgress = (i + 1) / 7
        const predictedPrice = basePrice + (targetPrice - basePrice) * dayProgress
        return {
          day: i + 1,
          price: Math.round(predictedPrice * 100) / 100,
        }
      })

      const mockData: PredictionData = {
        ticker: ticker.toUpperCase(),
        currentPrice: basePrice,
        targetPrice: targetPrice,
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
        volatility: Math.random() > 0.66 ? "High" : Math.random() > 0.33 ? "Medium" : "Low",
        historicalPrices,
        predictedPrice: targetPrice,
        forecastData,
      }

      setPredictionData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prediction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold text-slate-50">QUANTMIND</h1>
              <p className="text-xs md:text-sm text-slate-400 font-mono">AI-Powered Market Intelligence</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">System Status:</span>
              <span className="text-emerald-500 flex items-center gap-1">
                Online <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        <SearchBar onSearch={fetchPrediction} />

        {error && (
          <Alert variant="destructive" className="bg-rose-950/50 border-rose-900 text-rose-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <Skeleton className="h-8 w-32 mb-2 bg-slate-800" />
                <Skeleton className="h-12 w-full bg-slate-800" />
              </Card>
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <Skeleton className="h-8 w-32 mb-2 bg-slate-800" />
                <Skeleton className="h-12 w-full bg-slate-800" />
              </Card>
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <Skeleton className="h-8 w-32 mb-2 bg-slate-800" />
                <Skeleton className="h-12 w-full bg-slate-800" />
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <PriceChart data={predictionData || ({} as PredictionData)} loading={true} onForecastChange={() => {}} />
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <Skeleton className="h-64 w-full bg-slate-800" />
              </Card>
            </div>
          </div>
        )}

        {predictionData && !loading && (
          <>
            <HeadsUpDisplay data={predictionData} forecastDays={forecastDays} />
            <div className="grid gap-6 lg:grid-cols-2">
              <PriceChart data={predictionData} loading={false} onForecastChange={setForecastDays} />
              <ProfitSimulator data={predictionData} />
            </div>
          </>
        )}

        {!predictionData && !loading && !error && (
          <Card className="bg-slate-900/30 border-slate-800 border-dashed p-12 md:p-20">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-mono text-slate-400">Enter a ticker symbol to begin analysis</h3>
              <p className="text-sm text-slate-500 font-mono max-w-md mx-auto">
                Our AI will analyze market data and provide predictions in seconds
              </p>
            </div>
          </Card>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-xs font-mono text-slate-600">
            QuantMind © 2025 • AI Market Intelligence • Not Financial Advice
          </p>
        </div>
      </footer>
    </div>
  )
}
