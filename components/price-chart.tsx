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
  ReferenceLine,
  Legend,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronUp, ChevronDown } from "lucide-react"

/* -----------------------------
   Types
----------------------------- */
interface PricePoint {
  date: string
  price: number
}

interface ForecastPoint {
  date: string
  price: number
  lower: number
  upper: number
}

interface ChartPoint {
  date: string
  price?: number
  forecast?: number
  lower?: number
  upper?: number
  rsi?: number
  macd?: number
}

interface PriceChartProps {
  ticker: string
  onForecastChange: (days: number) => void
}

/* -----------------------------
   Indicators
----------------------------- */
function computeRSI(prices: number[], period = 14) {
  const rsi: number[] = []
  let gain = 0
  let loss = 0

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1]
    diff >= 0 ? (gain += diff) : (loss -= diff)
  }

  let rs = gain / (loss || 1)
  rsi[period] = 100 - 100 / (1 + rs)

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]
    gain = (gain * (period - 1) + Math.max(diff, 0)) / period
    loss = (loss * (period - 1) + Math.max(-diff, 0)) / period
    rs = gain / (loss || 1)
    rsi[i] = 100 - 100 / (1 + rs)
  }

  return rsi
}

function computeMACD(prices: number[]) {
  const ema = (p: number[], span: number) => {
    const k = 2 / (span + 1)
    const out = [p[0]]
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
export function PriceChart({ ticker, onForecastChange }: PriceChartProps) {
  const [forecastDays, setForecastDays] = useState(3)
  const [showBounds, setShowBounds] = useState(true)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<PricePoint[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])

  useEffect(() => {
    onForecastChange(forecastDays)
  }, [forecastDays, onForecastChange])

  /* -----------------------------
     Fetch data
  ----------------------------- */
  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)

        const hRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/history?ticker=${ticker}&days=60`
        )
        const fRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/forecast?ticker=${ticker}&days=${forecastDays}`
        )

        if (!hRes.ok || !fRes.ok) throw new Error("Chart fetch failed")

        const hJson = await hRes.json()
        const fJson = await fRes.json()

        if (active) {
          setHistory(hJson.historicalPrices)
          setForecast(fJson.points)
        }
      } catch (e) {
        console.error(e)
      } finally {
        active && setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [ticker, forecastDays])

  /* -----------------------------
     Build chart data
  ----------------------------- */
  const chartData: ChartPoint[] = useMemo(() => {
    if (!history.length) return []

    const prices = history.map((p) => p.price)
    const rsi = computeRSI(prices)
    const macd = computeMACD(prices)

    const hist: ChartPoint[] = history.map((p, i) => ({
      date: p.date,
      price: p.price,
      rsi: rsi[i],
      macd: macd[i],
    }))

    const pred: ChartPoint[] = forecast.map((p) => ({
      date: p.date,
      forecast: p.price,
      lower: p.lower,
      upper: p.upper,
    }))

    return [...hist, ...pred]
  }, [history, forecast])

  const forecastStartDate = history.at(-1)?.date

  if (loading || chartData.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <Skeleton className="h-[520px] w-full bg-slate-800/60" />
      </Card>
    )
  }

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-mono text-slate-400 uppercase">
          Price Forecast
        </h3>
        <p className="text-xs font-mono text-slate-500">
          Historical prices with AI-predicted continuation
        </p>
      </div>

      {/* Horizon Control */}
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 space-y-3">
        <Label className="font-mono text-slate-300">
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

          <Slider
            min={1}
            max={7}
            step={1}
            value={[forecastDays]}
            onValueChange={(v) => setForecastDays(v[0])}
          />

          <Button
            size="icon"
            variant="outline"
            disabled={forecastDays === 7}
            onClick={() => setForecastDays((d) => Math.min(7, d + 1))}
          >
            <ChevronUp />
          </Button>

          <span className="w-10 text-center font-mono text-emerald-400">
            {forecastDays}d
          </span>
        </div>
      </div>

      <Toggle
        pressed={showBounds}
        onPressedChange={setShowBounds}
        className="h-8 px-3 text-xs font-mono"
      >
        Confidence Bands
      </Toggle>

      {/* PRICE CHART */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
            />

            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={(v) => `$${v}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                borderColor: "#334155",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            />

            <Legend />

            {/* Forecast marker */}
            {forecastStartDate && (
              <ReferenceLine
                x={forecastStartDate}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{
                  value: "Forecast",
                  position: "top",
                  fill: "#94a3b8",
                  fontSize: 11,
                }}
              />
            )}

            {showBounds && (
              <Area
                dataKey="upper"
                fill="#10b981"
                fillOpacity={0.08}
                stroke="none"
              />
            )}

            {showBounds && (
              <Area
                dataKey="lower"
                fill="#10b981"
                fillOpacity={0.08}
                stroke="none"
              />
            )}

            {/* Historical */}
            <Line
              dataKey="price"
              name="Historical"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />

            {/* Forecast */}
            <Line
              dataKey="forecast"
              name="Forecast"
              stroke="#10b981"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-32">
        <p className="text-xs font-mono text-slate-400 mb-1">
          Relative Strength Index (RSI)
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={70} stroke="#475569" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#475569" strokeDasharray="3 3" />
            <Line dataKey="rsi" stroke="#38bdf8" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div className="h-32">
        <p className="text-xs font-mono text-slate-400 mb-1">
          MACD
        </p>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <YAxis hide />
            <ReferenceLine y={0} stroke="#475569" />
            <Line dataKey="macd" stroke="#facc15" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
