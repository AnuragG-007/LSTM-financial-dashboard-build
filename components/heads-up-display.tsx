"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Copy,
  Check,
} from "lucide-react"
import type { PredictionData } from "@/app/page"

/* -----------------------------
   Props
----------------------------- */
interface HeadsUpDisplayProps {
  data: PredictionData
  forecastDays: number
}

/* -----------------------------
   Component
----------------------------- */
export function HeadsUpDisplay({
  data,
  forecastDays,
}: HeadsUpDisplayProps) {
  const [copied, setCopied] = useState(false)

  /* -----------------------------
     Derived view (single source of truth)
  ----------------------------- */
  const view = useMemo(() => {
    const forecastPoint =
      data.forecastData[
        Math.min(forecastDays - 1, data.forecastData.length - 1)
      ]

    const targetPrice = forecastPoint?.price ?? data.targetPrice
    const priceChangePct =
      ((targetPrice - data.currentPrice) / data.currentPrice) * 100

    const isBullish = priceChangePct >= 0

    const confidence =
      forecastDays <= 2
        ? "High"
        : forecastDays <= 5
        ? "Medium"
        : "Low"

    return {
      targetPrice,
      priceChangePct,
      isBullish,
      confidence,
    }
  }, [data, forecastDays])

  /* -----------------------------
     Copy helper
  ----------------------------- */
  const handleCopy = () => {
    const text = `${data.ticker} | ${data.signal}
Current: $${data.currentPrice.toFixed(2)}
${forecastDays}D Target: $${view.targetPrice.toFixed(2)}
Change: ${view.priceChangePct.toFixed(2)}%`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const signalColor =
    data.signal.includes("BUY")
      ? "emerald"
      : data.signal.includes("SELL")
      ? "rose"
      : "amber"

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wide">
            Market Intelligence
          </h2>
          <p className="font-mono text-slate-200 text-lg">
            {data.ticker}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="font-mono gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr_1fr]">
        {/* SIGNAL (dominant) */}
        <div className="flex flex-col justify-center rounded-lg border border-slate-800 bg-slate-900/60 p-6">
          <span className="text-xs font-mono text-slate-500 uppercase mb-2">
            AI Signal
          </span>

          <span
            className={`text-4xl font-mono font-bold tracking-wide text-${signalColor}-500`}
          >
            {data.signal}
          </span>

          <div className="mt-4 flex items-center gap-2">
            {view.isBullish ? (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-500" />
            )}
            <span
              className={`text-xl font-mono font-bold ${
                view.isBullish ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {view.priceChangePct.toFixed(2)}%
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({forecastDays}D)
            </span>
          </div>
        </div>

        {/* PRICE ACTION */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
            <Target className="h-4 w-4" />
            Price
          </h3>

          <div>
            <p className="text-xs text-slate-500 font-mono">Current</p>
            <p className="text-3xl font-mono font-bold">
              ${data.currentPrice.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 font-mono">
              Target ({forecastDays}D)
            </p>
            <p className="text-xl font-mono">
              ${view.targetPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* AI METRICS */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Indicators
          </h3>

          {/* RSI */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-500">RSI</span>
              <span>{data.rsi.toFixed(1)}</span>
            </div>
            <Progress
              value={data.rsi}
              className="h-2"
              indicatorClassName={
                data.rsi > 70
                  ? "bg-rose-500"
                  : data.rsi < 30
                  ? "bg-emerald-500"
                  : "bg-amber-500"
              }
            />
          </div>

          {/* MACD */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-500">MACD</span>
            <Badge
              variant="outline"
              className={
                data.macd === "Bullish"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-rose-500 text-rose-500"
              }
            >
              {data.macd}
            </Badge>
          </div>

          {/* Confidence */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-500">
              Confidence
            </span>
            <Badge
              variant="outline"
              className={
                view.confidence === "High"
                  ? "border-emerald-500 text-emerald-500"
                  : view.confidence === "Medium"
                  ? "border-amber-500 text-amber-500"
                  : "border-rose-500 text-rose-500"
              }
            >
              {view.confidence}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
}
