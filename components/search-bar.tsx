"use client"

import { useState, type KeyboardEvent } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SearchBarProps {
  onSearch: (ticker: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [ticker, setTicker] = useState("")

  const handleSearch = () => {
    if (ticker.trim()) {
      onSearch(ticker.trim())
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const quickTickers = ["BTC-USD", "NVDA", "TSLA", "SPY"]

  return (
    <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <Input
              type="text"
              placeholder="Enter Ticker (e.g., AAPL)..."
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 font-mono text-lg h-12 md:h-14"
            />
          </div>
          <Button
            onClick={handleSearch}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-6 md:px-8"
          >
            Analyze
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-mono self-center">Quick:</span>
          {quickTickers.map((quickTicker) => (
            <Button
              key={quickTicker}
              variant="outline"
              size="sm"
              onClick={() => onSearch(quickTicker)}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 font-mono text-xs"
            >
              {quickTicker}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}
