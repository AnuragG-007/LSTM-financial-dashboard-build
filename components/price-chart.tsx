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
  upper?: number
  lower?: number
  rsi?: number
  macd?: number
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
    for (let i = 1; i < p.length; i++) {
      out[i] = p[i] * k + out[i - 1] * (1 - k)
    }
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
  ticker,
  onForecastChange,
}: {
  ticker: string
  onForecastChange: (days: number) => void
}) {
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

        const h = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/history?ticker=${ticker}&days=60`
        )
        const f = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/forecast?ticker=${ticker}&days=${forecastDays}`
        )

        if (!h.ok || !f.ok) throw new Error("Chart fetch failed")

        const hJson = await h.json()
        const fJson = await f.json()

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
  const chartData = useMemo<ChartPoint[]>(() => {
    if (!history.length) return []

    const prices = history.map((p) => p.price)
    const rsi = computeRSI(prices)
    const macd = computeMACD(prices)

    return [
      ...history.map((p, i) => ({
        date: p.date,
        price: p.price,
        rsi: rsi[i],
        macd: macd[i],
      })),
      ...forecast.map((p) => ({
        date: p.date,
        forecast: p.price,
        upper: p.upper,
        lower: p.lower,
      })),
    ]
  }, [history, forecast])

  const forecastStart = history.at(-1)?.date
  const forecastTrendUp =
    forecast.length >= 2 &&
    forecast.at(-1)!.price >= forecast[0].price

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-800">
        <Skeleton className="h-[520px]" />
      </Card>
    )
  }

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-6">
      <h3 className="text-sm font-mono uppercase text-slate-400">
        Price Forecast
      </h3>

      {/* Horizon Control */}
      <div className="flex items-center gap-3">
        <Label className="font-mono text-slate-300">
          Horizon
        </Label>

        <Button
          size="icon"
          variant="outline"
          disabled={forecastDays === 1}
          onClick={() => setForecastDays((d) => d - 1)}
        >
          <ChevronDown />
        </Button>

        <Slider
          min={1}
          max={7}
          step={1}
          value={[forecastDays]}
          onValueChange={(v) => setForecastDays(v[0])}
          className="max-w-xs"
        />

        <Button
          size="icon"
          variant="outline"
          disabled={forecastDays === 7}
          onClick={() => setForecastDays((d) => d + 1)}
        >
          <ChevronUp />
        </Button>

        <span className="font-mono text-emerald-400">
          {forecastDays}d
        </span>

        <Toggle
          pressed={showBounds}
          onPressedChange={setShowBounds}
          className="ml-auto text-xs font-mono"
        >
          Confidence
        </Toggle>
      </div>

      {/* PRICE CHART */}
      <div className="h-80">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis tick={{ fill: "#94a3b8", fontSize: 11 }} dataKey="date" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid #334155",
                fontFamily: "monospace",
                fontSize: 12,
              }}
            />

            {forecastStart && (
              <ReferenceLine
                x={forecastStart}
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

            {/* Confidence band */}
            {showBounds && (
              <Area
                dataKey="upper"
                stroke="none"
                fill="#10b981"
                fillOpacity={0.12}
                baseLine={(d) => d.lower ?? 0}
              />
            )}

            {/* Historical */}
            <Line
              dataKey="price"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
              name="Historical"
            />

            {/* Forecast */}
            <Line
              dataKey="forecast"
              stroke={forecastTrendUp ? "#22c55e" : "#ef4444"}
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
              name="Forecast"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-32">
        <p className="text-xs font-mono text-slate-400 mb-1">
          RSI (0–100)
        </p>
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <YAxis domain={[0, 100]} hide />
            <ReferenceLine y={70} stroke="#475569" strokeDasharray="3 3" />
            <ReferenceLine y={50} stroke="#334155" strokeDasharray="2 2" />
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
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <ReferenceLine y={0} stroke="#475569" />
            <Line
              dataKey="macd"
              stroke="#facc15"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
