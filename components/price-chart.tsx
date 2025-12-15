"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Toggle } from "@/components/ui/toggle"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts"
import type { PredictionData } from "@/app/page"

interface ChartPoint {
  date: string
  price: number
  isPrediction: boolean
  range?: [number, number]
  sma50?: number
}

interface PriceChartProps {
  data: PredictionData
  loading?: boolean
  onForecastChange: (days: number) => void
}

export function PriceChart({ data, loading = false, onForecastChange }: PriceChartProps) {
  const [forecastDays, setForecastDays] = useState(3)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [fetching, setFetching] = useState(false)
  const [showSMA, setShowSMA] = useState(false)
  const [showBounds, setShowBounds] = useState(true)

  // keep parent in sync
  useEffect(() => {
    onForecastChange(forecastDays)
  }, [forecastDays, onForecastChange])

  // fetch real historical + forecast data
  useEffect(() => {
    if (!data?.ticker) return

    const controller = new AbortController()

    const load = async () => {
      try {
        setFetching(true)

        // ✅ UPDATED: Use NEXT_PUBLIC_API_URL
        const historyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/history?ticker=${encodeURIComponent(data.ticker)}&days=60`,
          { signal: controller.signal },
        )
        const forecastRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/forecast?ticker=${encodeURIComponent(data.ticker)}&days=${forecastDays}`,
          { signal: controller.signal },
        )

        if (!historyRes.ok || !forecastRes.ok) {
          throw new Error("Failed to fetch chart data")
        }

        const history = (await historyRes.json()) as Array<{
          date: string
          price: number
          sma50?: number
        }>

        const forecast = (await forecastRes.json()) as Array<{
          date: string
          price: number
          lower?: number
          upper?: number
        }>

        const historicalPoints: ChartPoint[] = history.map((p) => ({
          date: p.date,
          price: p.price,
          isPrediction: false,
          sma50: p.sma50,
        }))

        const lastHistorical = historicalPoints[historicalPoints.length - 1]

        const safeForecast =
          forecast.length > 0
            ? forecast
            : lastHistorical
            ? [
                {
                  date: lastHistorical.date,
                  price: data.predictedPrice,
                  lower: data.predictedPrice,
                  upper: data.predictedPrice,
                },
              ]
            : []

        const forecastPoints: ChartPoint[] = safeForecast.map((p) => ({
          date: p.date,
          price: p.price,
          isPrediction: true,
          range:
            p.lower != null && p.upper != null ? [p.lower, p.upper] : undefined,
        }))

        const combined: ChartPoint[] = [...historicalPoints, ...forecastPoints]
        setChartData(combined)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        console.error(err)
      } finally {
        setFetching(false)
      }
    }

    load()
    return () => controller.abort()
  }, [data?.ticker, forecastDays, data?.predictedPrice])

  if (loading || fetching) {
    return (
      <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2 bg-slate-800" />
            <Skeleton className="h-3 w-48 bg-slate-800" />
          </div>
          <Skeleton className="h-32 w-full bg-slate-800 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-64 md:h-80 w-full bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-24 bg-slate-800" />
            <Skeleton className="h-4 w-24 bg-slate-800" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wide">
            Price Forecast
          </h3>
          <p className="text-xs text-slate-600 font-mono mt-1">
            Interactive Timeline with Prediction Horizon
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="forecast-slider"
              className="text-sm font-mono text-slate-300"
            >
              Prediction Horizon
            </Label>
            <span className="text-lg font-mono font-bold text-emerald-500">
              {forecastDays} {forecastDays === 1 ? "Day" : "Days"}
            </span>
          </div>
          <Slider
            id="forecast-slider"
            min={1}
            max={7}
            step={1}
            value={[forecastDays]}
            onValueChange={(value) => setForecastDays(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-slate-500">
            <span>1 Day</span>
            <span>7 Days</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-2">
              Indicators:
            </span>
            <Toggle
              pressed={showSMA}
              onPressedChange={setShowSMA}
              className="h-8 px-3 text-xs font-mono data-[state=on]:bg-orange-500/20 data-[state=on]:text-orange-400 data-[state=on]:border-orange-500/50"
            >
              Show SMA-50
            </Toggle>
            <Toggle
              pressed={showBounds}
              onPressedChange={setShowBounds}
              className="h-8 px-3 text-xs font-mono data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-400 data-[state=on]:border-blue-500/50"
            >
              Show Upper/Lower Bounds
            </Toggle>
          </div>
        </div>

        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 20, bottom: 25, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                style={{ fontSize: "11px", fontFamily: "monospace" }}
                tickFormatter={(value) => {
                  if (!value || typeof value !== "string") return ""
                  const parts = value.split("-")
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : value
                }}
              />
              <YAxis
                stroke="#64748b"
                style={{ fontSize: "11px", fontFamily: "monospace" }}
                domain={["auto", "auto"]}
                tickFormatter={(value) =>
                  typeof value === "number" ? `$${value.toFixed(0)}` : ""
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(value: any, _name: string, props: any) => {
                  if (typeof value !== "number") return ["N/A", ""]
                  const label = props.payload.isPrediction
                    ? "Predicted"
                    : "Historical"
                  return [`$${value.toFixed(2)}`, label]
                }}
              />

              {showBounds && (
                <Area
                  type="monotone"
                  dataKey="range"
                  stroke="none"
                  fill="#10b981"
                  fillOpacity={0.2}
                />
              )}

              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
                connectNulls={true}
              />

              {showSMA && (
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#fb923c"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="3 3"
                  connectNulls={true}
                />
              )}

              <Brush
                dataKey="date"
                height={30}
                stroke="#334155"
                fill="#0f172a"
                travellerWidth={10}
                tickFormatter={(value) => {
                  if (!value || typeof value !== "string") return ""
                  const parts = value.split("-")
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : value
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-8 bg-emerald-500" />
            <span className="text-slate-400">Historical &amp; Predicted</span>
          </div>
          {showSMA && (
            <div className="flex items-center gap-2">
              <div
                className="h-0.5 w-8"
                style={{ borderTop: "2px dashed #fb923c", background: "transparent" }}
              />
              <span className="text-slate-400">SMA-50</span>
            </div>
          )}
          {showBounds && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-8 bg-emerald-500 opacity-20 rounded" />
              <span className="text-slate-400">Confidence Interval</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
