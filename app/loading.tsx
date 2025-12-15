export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        {/* Subtle activity indicator */}
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse delay-300" />
        </div>

        {/* Status text */}
        <p className="text-slate-400 font-mono text-sm tracking-wide">
          Initializing market intelligence…
        </p>

        {/* Subtext */}
        <p className="text-slate-600 font-mono text-[11px]">
          Fetching data · Running models · Preparing charts
        </p>
      </div>
    </div>
  )
}
