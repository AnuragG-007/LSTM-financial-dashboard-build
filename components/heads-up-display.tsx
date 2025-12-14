"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Target, Brain, Copy, Check } from "lucide-react"
import type { PredictionData } from "@/app/page"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"

interface HeadsUpDisplayProps {
  data: PredictionData
  forecastDays: number
}

export function HeadsUpDisplay({ data, forecastDays }: HeadsUpDisplayProps) {
  const [copied, setCopied] = useState(false)

  const selectedData = useMemo(() => {
    const forecastPrice = data.forecastData[forecastDays - 1]?.price || data.targetPrice
    const priceChange = ((forecastPrice - data.currentPrice) / data.currentPrice) * 100
    const isPositive = priceChange > 0

    // Confidence level based on forecast horizon
    let confidenceLevel: "High" | "Medium" | "Low"
    let confidenceColor: string
    if (forecastDays <= 2) {
      confidenceLevel = "High"
      confidenceColor = "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
    } else if (forecastDays <= 5) {
      confidenceLevel = "Medium"
      confidenceColor = "border-amber-500/50 text-amber-500 bg-amber-500/10"
    } else {
      confidenceLevel = "Low"
      confidenceColor = "border-rose-500/50 text-rose-500 bg-rose-500/10"
    }

    return {
      targetPrice: forecastPrice,
      priceChange,
      isPositive,
      confidenceLevel,
      confidenceColor,
    }
  }, [data.currentPrice, data.forecastData, data.targetPrice, forecastDays])

  const handleCopy = () => {
    const text = `${data.ticker}: ${data.signal} | Current: $${data.currentPrice.toFixed(2)} | ${forecastDays}D Target: $${selectedData.targetPrice.toFixed(2)} | Change: ${selectedData.isPositive ? "+" : ""}${selectedData.priceChange.toFixed(2)}%`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-mono text-slate-400 uppercase tracking-wide">
          Market Intelligence • {data.ticker}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300 font-mono gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Results
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Card 1: The Signal (Static) */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wide">AI Signal</h3>
            <div className="flex items-center justify-center py-4">
              <Badge
                className={`text-2xl md:text-3xl font-mono font-bold px-6 py-3 ${
                  data.signal.includes("BUY")
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : data.signal.includes("SELL")
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                }`}
              >
                {data.signal}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Card 2: Price Action (Dynamic - bound to forecastDays) */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Target className="h-4 w-4" />
              Price Action
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-mono">Current Price</p>
                <p className="text-3xl font-mono font-bold text-slate-50">${data.currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono">Target Price ({forecastDays}D)</p>
                <p className="text-xl font-mono font-semibold text-slate-300">${selectedData.targetPrice.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                {selectedData.isPositive ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                )}
                <span
                  className={`text-2xl font-mono font-bold ${selectedData.isPositive ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {selectedData.isPositive ? "+" : ""}
                  {selectedData.priceChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: AI Metrics (RSI & MACD static, Confidence dynamic) */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-900/50 border-slate-800 p-6">
          <div className="space-y-4">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-xs text-slate-500 font-mono">RSI</p>
                  <p className="text-sm font-mono font-semibold text-slate-300">{data.rsi.toFixed(1)}</p>
                </div>
                <Progress
                  value={data.rsi}
                  className="h-2 bg-slate-800"
                  indicatorClassName={data.rsi > 70 ? "bg-rose-500" : data.rsi < 30 ? "bg-emerald-500" : "bg-amber-500"}
                />
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-slate-500 font-mono">MACD Signal</p>
                <Badge
                  variant="outline"
                  className={`font-mono ${
                    data.macd === "Bullish"
                      ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                      : "border-rose-500/50 text-rose-500 bg-rose-500/10"
                  }`}
                >
                  {data.macd}
                </Badge>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-slate-500 font-mono">Confidence Level</p>
                <Badge variant="outline" className={`font-mono ${selectedData.confidenceColor}`}>
                  {selectedData.confidenceLevel}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
