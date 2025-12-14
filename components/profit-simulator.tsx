"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp } from "lucide-react"
import type { PredictionData } from "@/app/page"

interface ProfitSimulatorProps {
  data: PredictionData
}

export function ProfitSimulator({ data }: ProfitSimulatorProps) {
  const [investment, setInvestment] = useState("1000")
  const [projectedValue, setProjectedValue] = useState(0)
  const [profit, setProfit] = useState(0)

  useEffect(() => {
    const investmentAmount = Number.parseFloat(investment) || 0
    const change = data.predictedChange / 100
    const projected = investmentAmount * (1 + change)
    const profitAmount = projected - investmentAmount

    setProjectedValue(projected)
    setProfit(profitAmount)
  }, [investment, data.predictedChange])

  const isPositive = profit > 0

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wide flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profit Simulator
          </h3>
          <p className="text-xs text-slate-600 font-mono mt-1">Calculate potential returns based on AI prediction</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment" className="text-slate-400 font-mono text-xs uppercase">
            Investment Amount ($)
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              id="investment"
              type="number"
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-slate-50 font-mono text-lg h-12"
              placeholder="1000"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="space-y-4 p-6 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <div>
            <p className="text-xs text-slate-500 font-mono uppercase mb-2">Projected Value</p>
            <p className="text-4xl font-mono font-bold text-slate-50">${projectedValue.toFixed(2)}</p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 font-mono uppercase mb-2">
              Estimated {isPositive ? "Profit" : "Loss"}
            </p>
            <p className={`text-3xl font-mono font-bold ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {isPositive ? "+" : ""}${profit.toFixed(2)}
            </p>
            <p className={`text-sm font-mono mt-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
              ({isPositive ? "+" : ""}
              {data.predictedChange.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <p className="text-xs font-mono text-amber-400 leading-relaxed">
            ⚠️ This is a simulated calculation based on AI predictions. Not financial advice. Past performance does not
            guarantee future results.
          </p>
        </div>
      </div>
    </Card>
  )
}
