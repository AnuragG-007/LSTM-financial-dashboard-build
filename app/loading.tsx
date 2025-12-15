export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-emerald-400 animate-spin" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="font-mono text-sm text-slate-300 tracking-wide">
            Initializing QuantMind
          </p>
          <p className="font-mono text-xs text-slate-500">
            Fetching market data & generating forecasts…
          </p>
        </div>
      </div>
    </div>
  )
}
