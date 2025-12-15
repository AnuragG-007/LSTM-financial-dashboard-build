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
     Derived (single source of truth)
  ----------------------------- */
  const view = useMemo(() => {
    const forecastPoint =
      data.forecastData[Math.min(forecastDays - 1, data.forecastData.length - 1)]

    const targetPrice = forecastPoint?.price ?? data.targetPrice
    const priceChangePct =
      ((targetPrice - data.currentPrice) / data.currentPrice) * 100

    const isBullish = priceChangePct > 0

    // Horizon-based confidence (standard quant heuristic)
    const confidence =
      forecastDays <= 2
        ? { label: "High", color: "emerald" }
        : forecastDays <= 5
        ? { label: "Medium", color: "amber" }
        : { label: "Low", color: "rose" }

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

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-mono text-slate-400 uppercase tracking-wide">
          Market Intelligence • {data.ticker}
        </h2>
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

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* SIGNAL */}
        <Card className="bg-slate-900/60 border-slate-800 p-6">
          <h3 className="text-xs font-mono text-slate-400 uppercase mb-4">
            AI Signal
          </h3>
          <div className="flex justify-center">
            <Badge
              className={`text-2xl font-mono px-6 py-3 ${
                data.signal.includes("BUY")
                  ? "bg-emerald-600 text-white"
                  : data.signal.includes("SELL")
                  ? "bg-rose-600 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              {data.signal}
            </Badge>
          </div>
        </Card>

        {/* PRICE ACTION */}
        <Card className="bg-slate-900/60 border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
            <Target className="h-4 w-4" />
            Price Action
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

          <div className="flex items-center gap-2">
            {view.isBullish ? (
              <TrendingUp className="text-emerald-500" />
            ) : (
              <TrendingDown className="text-rose-500" />
            )}
            <span
              className={`text-xl font-mono font-bold ${
                view.isBullish ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {view.priceChangePct.toFixed(2)}%
            </span>
          </div>
        </Card>

        {/* AI METRICS */}
        <Card className="bg-slate-900/60 border-slate-800 p-6 space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Metrics
          </h3>

          {/* RSI */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span>RSI</span>
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
              className={`border-${view.confidence.color}-500 text-${view.confidence.color}-500`}
            >
              {view.confidence.label}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
