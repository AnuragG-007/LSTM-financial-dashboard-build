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
    <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter ticker (e.g. BTC-USD)"
            className="pl-10 bg-slate-900 border-slate-700 text-slate-50 placeholder:text-slate-500 font-mono text-lg h-12 md:h-14"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={handleSearch}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-mono"
          >
            Analyze
          </Button>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
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
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-300 font-mono text-xs"
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
