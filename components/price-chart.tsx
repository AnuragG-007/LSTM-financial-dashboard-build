"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown } from "lucide-react"
import type { PredictionData } from "@/app/page"

/* -----------------------------
   Types
----------------------------- */
interface ChartPoint {
  date: string
  price: number
  lower?: number
  upper?: number
  rsi?: number
  macd?: number
  isPrediction: boolean
}

interface PriceChartProps {
  data: PredictionData
  loading?: boolean
  onForecastChange: (days: number) => void
}

/* -----------------------------
   Helpers (deterministic)
----------------------------- */
function computeRSI(prices: number[], period = 14) {
  const rsi: number[] = []
  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }

  let rs = gains / (losses || 1)
  rsi[period] = 100 - 100 / (1 + rs)

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    gains = (gains * (period - 1) + Math.max(diff, 0)) / period
    losses = (losses * (period - 1) + Math.max(-diff, 0)) / period
    rs = gains / (losses || 1)
    rsi[i] = 100 - 100 / (1 + rs)
  }

  return rsi
}

function computeMACD(prices: number[]) {
  const ema = (p: number[], span: number) => {
    const k = 2 / (span + 1)
    const out: number[] = [p[0]]
    for (let i = 1; i < p.length; i++)
      out[i] = p[i] * k + out[i - 1] * (1 - k)
    return out
  }

  const fast = ema(prices, 12)
  const slow = ema(prices, 26)
  return fast.map((v, i) => v - (slow[i] ?? v))
}

/* -----------------------------
   Component
----------------------------- */
export function PriceChart({
  data,
  loading = false,
  onForecastChange,
}: PriceChartProps) {
  const [forecastDays, setForecastDays] = useState(3)
  const [showBounds, setShowBounds] = useState(true)

  useEffect(() => {
    onForecastChange(forecastDays)
  }, [forecastDays, onForecastChange])

  /* -----------------------------
     Build chart data
  ----------------------------- */
  const chartData: ChartPoint[] = useMemo(() => {
    if (!data) return []

    const prices = data.historicalPrices.map((p) => p.price)
    const rsi = computeRSI(prices)
    const macd = computeMACD(prices)

    const historical: ChartPoint[] = data.historicalPrices.map((p, i) => ({
      date: p.date,
      price: p.price,
      rsi: rsi[i],
      macd: macd[i],
      isPrediction: false,
    }))

    const forecast =
      data.chart?.points
        ?.slice(1, forecastDays + 1)
        .map((p) => ({
          date: p.date,
          price: p.price,
          lower: p.lower,
          upper: p.upper,
          isPrediction: true,
        })) ?? []

    return [...historical, ...forecast]
  }, [data, forecastDays])

  if (loading || chartData.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <Skeleton className="h-80 w-full bg-slate-800" />
      </Card>
    )
  }

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-6">
      <div>
        <h3 className="text-sm font-mono text-slate-400 uppercase">
          Price Forecast
        </h3>
        <p className="text-xs text-slate-600 font-mono">
          Historical + AI Prediction
        </p>
      </div>

      {/* Horizon Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <Label className="font-mono text-slate-300 mb-2 block">
          Prediction Horizon
        </Label>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            disabled={forecastDays === 1}
            onClick={() => setForecastDays((d) => Math.max(1, d - 1))}
          >
            <ChevronDown />
          </Button>

          <div className="flex-1">
            <Slider
              min={1}
              max={7}
              step={1}
              value={[forecastDays]}
              onValueChange={(v) => setForecastDays(v[0])}
            />
          </div>

          <Button
            size="icon"
            variant="outline"
            disabled={forecastDays === 7}
            onClick={() => setForecastDays((d) => Math.min(7, d + 1))}
          >
            <ChevronUp />
          </Button>

          <span className="w-12 text-center font-mono text-emerald-400">
            {forecastDays}d
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-2">
        <Toggle
          pressed={showBounds}
          onPressedChange={setShowBounds}
          className="h-8 px-3 text-xs font-mono"
        >
          Confidence Bands
        </Toggle>
      </div>

      {/* PRICE CHART */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />

            {showBounds && (
              <>
                <Area dataKey="upper" fill="#10b981" opacity={0.15} />
                <Area dataKey="lower" fill="#10b981" opacity={0.15} />
              </>
            )}

            <Line
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} />
            <Line dataKey="rsi" stroke="#38bdf8" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis dataKey="date" hide />
            <YAxis />
            <Line dataKey="macd" stroke="#facc15" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
