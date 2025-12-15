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
    const value = ticker.trim()
    if (value) {
      onSearch(value.toUpperCase())
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const quickTickers = ["BTC-USD", "NVDA", "TSLA", "SPY"]

  return (
    <Card className="bg-slate-900/40 border-slate-800 px-4 py-3">
      <div className="flex flex-col gap-3">
        {/* Command Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyDown={handleKeyPress}
            placeholder="Enter ticker symbol (e.g. BTC-USD, NVDA)"
            className="pl-9 h-11 bg-slate-950 border-slate-700 text-slate-50 placeholder:text-slate-500 font-mono text-base"
          />

          {/* Inline action hint */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-500">
            Enter ↵
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          {/* Primary Action */}
          <Button
            onClick={handleSearch}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-mono"
          >
            Analyze
          </Button>

          {/* Quick symbols */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span>Quick:</span>
            {quickTickers.map((quickTicker) => (
              <Button
                key={quickTicker}
                size="xs"
                variant="outline"
                onClick={() => {
                  setTicker(quickTicker)
                  onSearch(quickTicker)
                }}
                className="h-6 px-2 bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 font-mono"
              >
                {quickTicker}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
