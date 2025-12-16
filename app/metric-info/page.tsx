import { Card } from "@/components/ui/card";
import {
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Signal,
  Wind,
} from "lucide-react";
import Link from "next/link";

export default function MetricInfoPage() {
  const metrics = [
    {
      id: 1,
      icon: TrendingUp,
      name: "RSI (Relative Strength Index)",
      formula:
        "RSI = 100 - [100 / (1 + RS)], where RS = Avg Gain / Avg Loss (14-period)",
      description:
        "Momentum oscillator measuring the speed and magnitude of price changes over a 14-period window. Identifies overbought (>70) and oversold (<30) conditions.",
      implementation: {
        calculation:
          "Rolling 14-day average of gains divided by rolling 14-day average of losses",
        range: "0 to 100",
        interpretation:
          "Values above 70 indicate overbought conditions; below 30 indicate oversold",
      },
      color: "cyan",
      useCase: "Identifying potential reversal points and momentum shifts",
      codeSnippet: `delta = df["Close"].diff()
gain = delta.where(delta > 0, 0).rolling(window=14).mean()
loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
rs = gain / loss
df["RSI"] = 100 - (100 / (1 + rs))`,
    },
    {
      id: 2,
      icon: Signal,
      name: "MACD (Moving Average Convergence Divergence)",
      formula: "MACD = EMA₁₂ - EMA₂₆",
      description:
        "Trend-following momentum indicator showing the relationship between two exponential moving averages (12-day and 26-day). Crossovers signal potential trend changes.",
      implementation: {
        calculation: "12-period EMA minus 26-period EMA",
        range: "Unbounded (depends on price scale)",
        interpretation:
          "Positive values indicate upward momentum; negative values indicate downward momentum",
      },
      color: "amber",
      useCase: "Detecting trend direction and momentum strength",
      codeSnippet: `exp1 = df["Close"].ewm(span=12, adjust=False).mean()
exp2 = df["Close"].ewm(span=26, adjust=False).mean()
df["MACD"] = exp1 - exp2`,
    },
    {
      id: 3,
      icon: Target,
      name: "MA50 (50-Day Moving Average)",
      formula: "MA50 = (1/50) Σ Close Prices (last 50 days)",
      description:
        "Simple moving average over 50 trading days. Acts as dynamic support/resistance level and smooths short-term price fluctuations to reveal medium-term trends.",
      implementation: {
        calculation: "Rolling 50-day mean of closing prices",
        range: "Follows price scale",
        interpretation: "Price above MA50 = bullish; below = bearish",
      },
      color: "violet",
      useCase:
        "Identifying medium-term trend direction and support/resistance levels",
      codeSnippet: `df["MA50"] = df["Close"].rolling(window=50).mean()`,
    },
    {
      id: 4,
      icon: BarChart3,
      name: "Log Volume",
      formula: "Log Volume = ln(Volume + 1)",
      description:
        "Logarithmic transformation of trading volume normalizes extreme values and makes the feature more suitable for model training. Stabilizes variance across different volume scales.",
      implementation: {
        calculation: "Natural logarithm of volume (with +1 to handle zeros)",
        range: "0 to ~log(max volume)",
        interpretation: "Higher values indicate increased trading activity",
      },
      color: "emerald",
      useCase: "Normalizing volume data for machine learning models",
      codeSnippet: `df["Log_Volume"] = np.log(df["Volume"] + 1)`,
    },
    {
      id: 5,
      icon: Wind,
      name: "Volatility Classification",
      formula:
        "σ = √[Σ(return - mean)² / n], where return = (Close_t - Close_t-1) / Close_t-1",
      description:
        "Measures price variability using standard deviation of returns. Different thresholds apply for stocks and crypto assets due to inherent volatility differences.",
      implementation: {
        calculation: "Standard deviation of percentage price changes",
        range: "0 to ∞ (expressed as decimal)",
        interpretation:
          "Classified as Low, Medium, or High based on asset type",
      },
      color: "red",
      useCase: "Risk assessment and position sizing decisions",
      thresholds: {
        stocks: {
          low: "σ < 0.008 (0.8%)",
          medium: "0.008 ≤ σ < 0.02 (0.8% - 2%)",
          high: "σ ≥ 0.02 (≥2%)",
        },
        crypto: {
          low: "σ < 0.02 (2%)",
          medium: "0.02 ≤ σ < 0.05 (2% - 5%)",
          high: "σ ≥ 0.05 (≥5%)",
        },
      },
      codeSnippet: `returns = df["Close"].pct_change().dropna()
vol = returns.std()

# Stock thresholds
if vol < 0.008: return "Low"
if vol < 0.02: return "Medium"
return "High"`,
    },
  ];

  const signals = {
    stocks: [
      {
        label: "STRONG BUY",
        threshold: "> +1.5%",
        color: "text-emerald-400 bg-emerald-500/10",
      },
      {
        label: "BUY",
        threshold: "> +0.3%",
        color: "text-emerald-300 bg-emerald-500/5",
      },
      {
        label: "HOLD",
        threshold: "-0.3% to +0.3%",
        color: "text-slate-400 bg-slate-500/10",
      },
      {
        label: "SELL",
        threshold: "< -0.3%",
        color: "text-red-300 bg-red-500/5",
      },
      {
        label: "STRONG SELL",
        threshold: "< -1.5%",
        color: "text-red-400 bg-red-500/10",
      },
    ],
    crypto: [
      {
        label: "STRONG BUY",
        threshold: "> +3.0%",
        color: "text-emerald-400 bg-emerald-500/10",
      },
      {
        label: "BUY",
        threshold: "> +0.8%",
        color: "text-emerald-300 bg-emerald-500/5",
      },
      {
        label: "HOLD",
        threshold: "-0.8% to +0.8%",
        color: "text-slate-400 bg-slate-500/10",
      },
      {
        label: "SELL",
        threshold: "< -0.8%",
        color: "text-red-300 bg-red-500/5",
      },
      {
        label: "STRONG SELL",
        threshold: "< -3.0%",
        color: "text-red-400 bg-red-500/10",
      },
    ],
  };

  const colorClasses: Record<
    string,
    { bg: string; border: string; text: string; icon: string }
  > = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      icon: "text-emerald-500",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      icon: "text-cyan-500",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      text: "text-violet-400",
      icon: "text-violet-500",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      icon: "text-red-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      icon: "text-amber-500",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-slate-500 hover:text-emerald-400 transition-colors"
        >
          ← Back to Terminal
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-mono text-3xl font-bold text-slate-100">
                Technical Indicators & Metrics
              </h1>
              <p className="font-mono text-sm text-slate-500">
                Understanding the 5 core indicators powering QuantMind forecasts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <div className="space-y-4">
          <h2 className="font-mono text-xl font-semibold text-slate-200">
            How QuantMind Analyzes Markets
          </h2>
          <p className="font-mono text-sm text-slate-400 leading-relaxed">
            QuantMind&apos;s AI model processes five fundamental technical
            indicators to generate price forecasts. These indicators capture
            momentum, trend direction, volume dynamics, and volatility—providing
            a comprehensive view of market conditions. All indicators are
            calculated using proven mathematical formulas and integrated into
            the neural network architecture.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="space-y-1">
              <p className="font-mono text-xs text-slate-500 uppercase">
                Data Processing
              </p>
              <p className="font-mono text-sm text-slate-300">
                Dropna after feature engineering
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs text-slate-500 uppercase">
                Timeframe
              </p>
              <p className="font-mono text-sm text-slate-300">
                60-day historical + 7-day forecast
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-xs text-slate-500 uppercase">
                Update Frequency
              </p>
              <p className="font-mono text-sm text-slate-300">
                Real-time with &lt;200ms latency
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="space-y-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const colors = colorClasses[metric.color];

          return (
            <Card
              key={metric.id}
              className="bg-slate-900/50 border-slate-800 p-6 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colors.border} ${colors.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-mono text-lg font-semibold ${colors.text}`}
                      >
                        {metric.name}
                      </h3>
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-mono text-slate-400">
                        Indicator #{metric.id}
                      </span>
                    </div>

                    <div className="rounded-lg bg-slate-950/50 border border-slate-800 px-4 py-2">
                      <code className="font-mono text-xs text-slate-300">
                        {metric.formula}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="font-mono text-sm text-slate-400 leading-relaxed">
                  {metric.description}
                </p>

                {/* Implementation Details */}
                <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Implementation Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-semibold text-emerald-400">
                        Calculation
                      </span>
                      <p className="font-mono text-xs text-slate-500">
                        {metric.implementation.calculation}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-semibold text-cyan-400">
                        Range
                      </span>
                      <p className="font-mono text-xs text-slate-500">
                        {metric.implementation.range}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-semibold text-violet-400">
                        Interpretation
                      </span>
                      <p className="font-mono text-xs text-slate-500">
                        {metric.implementation.interpretation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Volatility Thresholds (only for metric 5) */}
                {metric.thresholds && (
                  <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/30 p-4">
                    <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Classification Thresholds
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h5 className="font-mono text-xs font-semibold text-cyan-400">
                          Stocks
                        </h5>
                        <div className="space-y-1 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-mono text-xs text-slate-400">
                              Low: {metric.thresholds.stocks.low}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="font-mono text-xs text-slate-400">
                              Medium: {metric.thresholds.stocks.medium}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="font-mono text-xs text-slate-400">
                              High: {metric.thresholds.stocks.high}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h5 className="font-mono text-xs font-semibold text-violet-400">
                          Crypto
                        </h5>
                        <div className="space-y-1 pl-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-mono text-xs text-slate-400">
                              Low: {metric.thresholds.crypto.low}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span className="font-mono text-xs text-slate-400">
                              Medium: {metric.thresholds.crypto.medium}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span className="font-mono text-xs text-slate-400">
                              High: {metric.thresholds.crypto.high}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Snippet */}
                <div className="space-y-2">
                  <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Backend Implementation
                  </h4>
                  <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
                    <pre className="font-mono text-xs text-slate-300 leading-relaxed">
                      {metric.codeSnippet}
                    </pre>
                  </div>
                </div>

                {/* Use Case */}
                <div className="flex items-start gap-2 pt-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 uppercase shrink-0">
                    Primary Use:
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {metric.useCase}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Signal Classification */}
      <Card className="bg-slate-900/50 border-slate-800 p-6">
        <div className="space-y-4">
          <h2 className="font-mono text-xl font-semibold text-slate-200">
            Trading Signal Classification
          </h2>
          <p className="font-mono text-sm text-slate-400 leading-relaxed">
            Based on predicted percentage price changes, QuantMind classifies
            forecasts into five action signals. Thresholds differ between stocks
            and crypto to account for inherent volatility differences.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-semibold text-cyan-400">
                Stock Signals
              </h3>
              <div className="space-y-2">
                {signals.stocks.map((signal) => (
                  <div
                    key={signal.label}
                    className={`flex items-center justify-between rounded-lg border border-slate-800 px-4 py-2 ${signal.color}`}
                  >
                    <span className="font-mono text-xs font-semibold">
                      {signal.label}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {signal.threshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-mono text-sm font-semibold text-violet-400">
                Crypto Signals
              </h3>
              <div className="space-y-2">
                {signals.crypto.map((signal) => (
                  <div
                    key={signal.label}
                    className={`flex items-center justify-between rounded-lg border border-slate-800 px-4 py-2 ${signal.color}`}
                  >
                    <span className="font-mono text-xs font-semibold">
                      {signal.label}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {signal.threshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Best Practices */}
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-slate-700 p-6">
        <div className="space-y-4">
          <h2 className="font-mono text-xl font-semibold text-slate-200">
            Indicator Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-mono text-sm font-semibold text-emerald-400">
                ✓ Recommended Usage
              </h3>
              <ul className="space-y-1 font-mono text-xs text-slate-400">
                <li>• Combine multiple indicators for confirmation</li>
                <li>• Watch for RSI divergences with price action</li>
                <li>• Use MACD crossovers with trend context</li>
                <li>• Compare price position relative to MA50</li>
                <li>• Consider volatility when sizing positions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-mono text-sm font-semibold text-red-400">
                ✗ Common Pitfalls
              </h3>
              <ul className="space-y-1 font-mono text-xs text-slate-400">
                <li>• Don&apos;t rely on single indicator signals</li>
                <li>• Avoid trading solely based on RSI extremes</li>
                <li>• Don&apos;t ignore high volatility warnings</li>
                <li>• Never treat forecasts as guarantees</li>
                <li>• Don&apos;t overlook asset-specific thresholds</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 font-mono text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
        >
          <Activity className="h-4 w-4" />
          Back to Forecasting Terminal
        </Link>
      </div>
    </div>
  );
}
