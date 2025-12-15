"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import type { PredictionData } from "@/app/page"

interface ProfitSimulatorProps {
  data: PredictionData
  forecastDays: number
}

export function ProfitSimulator({
  data,
  forecastDays,
}: ProfitSimulatorProps) {
  const [investment, setInvestment] = useState("1000")
  const [projectedValue, setProjectedValue] = useState(0)
  const [profit, setProfit] = useState(0)

  /* -----------------------------
     Forecast view
  ----------------------------- */
  const forecastView = useMemo(() => {
    const forecastPoint =
      data.forecastData[
        Math.min(forecastDays - 1, data.forecastData.length - 1)
      ]

    const targetPrice = forecastPoint?.price ?? data.targetPrice
    const changePct =
      ((targetPrice - data.currentPrice) / data.currentPrice) * 100

    return { targetPrice, changePct }
  }, [data, forecastDays])

  /* -----------------------------
     Recalculate profit
  ----------------------------- */
  useEffect(() => {
    const amount = Number.parseFloat(investment)
    if (!amount || amount <= 0) {
      setProjectedValue(0)
      setProfit(0)
      return
    }

    const projected = amount * (1 + forecastView.changePct / 100)
    setProjectedValue(projected)
    setProfit(projected - amount)
  }, [investment, forecastView.changePct])

  const isPositive = profit >= 0

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <Card className="bg-slate-900/50 border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-mono uppercase text-slate-400 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Profit Simulator
        </h3>
        <p className="text-xs font-mono text-slate-600 mt-1">
          Hypothetical outcome over {forecastDays}{" "}
          {forecastDays === 1 ? "day" : "days"}
        </p>
      </div>

      {/* Investment Input */}
      <div className="space-y-2">
        <Label
          htmlFor="investment"
          className="text-xs font-mono uppercase text-slate-500"
        >
          Investment Amount
        </Label>

        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            id="investment"
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="pl-9 h-10 bg-slate-950 border-slate-700 text-slate-50 font-mono text-sm"
            placeholder="1000"
            min="0"
            step="100"
          />
        </div>
      </div>

      {/* Results */}
      <div className="rounded-md bg-slate-800/40 p-4 space-y-3">
        <div>
          <p className="text-[11px] font-mono uppercase text-slate-500">
            Projected Value
          </p>
          <p className="text-2xl font-mono font-bold text-slate-50">
            ${projectedValue.toFixed(2)}
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            Target price: ${forecastView.targetPrice.toFixed(2)}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-700/50">
          <p className="text-[11px] font-mono uppercase text-slate-500">
            Estimated {isPositive ? "Profit" : "Loss"}
          </p>
          <p
            className={`text-xl font-mono font-bold ${
              isPositive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isPositive ? "+" : "-"}${Math.abs(profit).toFixed(2)}
          </p>
          <p
            className={`text-[11px] font-mono ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            ({forecastView.changePct.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Disclaimer / Warning */}
      <div className="flex gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[11px] font-mono text-amber-400 leading-relaxed">
          This is a simulated outcome based on the model’s forecast.
          It does not account for slippage, fees, or market volatility and
          should not be considered financial advice.
        </p>
      </div>
    </Card>
  )
}
