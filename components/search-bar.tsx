"use client"

import { useState, type KeyboardEvent } from "react"
import { Search, CornerDownLeft, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchBarProps {
  onSearch: (ticker: string) => void
}

/* -----------------------------
   Supported universe (Alpha Vantage)
----------------------------- */
const SUPPORTED_TICKERS = [
  // US Stocks
  "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL",
  "META", "TSLA", "AMD", "NFLX", "JPM",

  // ETFs
  "SPY", "QQQ", "DIA", "IWM", "VTI",

  // Crypto
  "BTC-USD", "ETH-USD", "SOL-USD",
  "BNB-USD", "ADA-USD",
]

export function SearchBar({ onSearch }: SearchBarProps) {
  const [ticker, setTicker] = useState("")

  const handleSearch = () => {
    const value = ticker.trim().toUpperCase()
    if (!value) return

    onSearch(value)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-5 space-y-4">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />

        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={handleKeyPress}
          placeholder="Search supported ticker (e.g. AAPL, BTC-USD)"
          className="pl-9 pr-28 h-11 bg-slate-950 border-slate-700 text-slate-50 placeholder:text-slate-500 font-mono text-sm"
        />

        <Button
          onClick={handleSearch}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-mono text-xs"
        >
          Analyze
          <CornerDownLeft className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Scope + Supported tickers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <Info className="h-3 w-3" />
          <span>
            Supports US stocks, ETFs, and crypto pairs (Alpha Vantage)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUPPORTED_TICKERS.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="cursor-pointer border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-mono text-[11px]"
              onClick={() => {
                setTicker(t)
                onSearch(t)
              }}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  )
}
