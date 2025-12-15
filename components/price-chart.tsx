"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown } from "lucide-react";

/* ----------------------------- Types ----------------------------- */

interface PricePoint {
  date: string;
  price: number;
}

// backend sends: { date, price, lower, upper }
interface ForecastPoint {
  date: string;
  price: number;    // <-- changed: was forecast
  lower: number;
  upper: number;
}

interface ChartPoint {
  date: string;
  price?: number;
  forecast?: number;
  upperBand?: number;
  lowerBand?: number;
  rangeBase?: number;
  rangeTop?: number;
  rsi?: number;
  macd?: number;
  isPrediction: boolean;
}

interface PriceChartProps {
  ticker: string;
  onForecastChange: (days: number) => void;
}

/* ----------------------------- Indicators ----------------------------- */

function computeRSI(prices: number[], period = 14) {
  const rsi: number[] = [];
  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    diff >= 0 ? (gain += diff) : (loss -= diff);
  }

  let rs = gain / (loss || 1);
  rsi[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gain = (gain * (period - 1) + Math.max(diff, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-diff, 0)) / period;
    rs = gain / (loss || 1);
    rsi[i] = 100 - 100 / (1 + rs);
  }

  return rsi;
}

function computeMACD(prices: number[]) {
  const ema = (p: number[], span: number) => {
    const k = 2 / (span + 1);
    const out = [p[0]];
    for (let i = 1; i < p.length; i++) {
      out[i] = p[i] * k + out[i - 1] * (1 - k);
    }
    return out;
  };

  const fast = ema(prices, 12);
  const slow = ema(prices, 26);
  return fast.map((v, i) => v - (slow[i] ?? v));
}

/* ----------------------------- Custom Tooltip ----------------------------- */

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const isPrediction = dataPoint?.isPrediction;

  const seen = new Set();
  const uniquePayload = payload.filter((entry: any) => {
    if (!entry.value || entry.dataKey === "rangeBase" || entry.dataKey === "rangeTop")
      return false;
    if (seen.has(entry.dataKey)) return false;
    seen.add(entry.dataKey);
    return true;
  });

  const sortOrder: Record<string, number> = {
    forecast: 0,
    upperBand: 1,
    lowerBand: 2,
    price: 3,
  };

  const sortedPayload = uniquePayload.sort((a: any, b: any) => {
    const orderA = sortOrder[a.dataKey] ?? 99;
    const orderB = sortOrder[b.dataKey] ?? 99;
    return orderA - orderB;
  });

  return (
    <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 shadow-xl">
      <p className="font-mono text-xs text-slate-400 mb-2">{label}</p>
      {sortedPayload.map((entry: any, index: number) => {
        let displayLabel = entry.name;
        let color = entry.color;

        if (entry.dataKey === "upperBand") displayLabel = "Upper Bound";
        if (entry.dataKey === "lowerBand") displayLabel = "Lower Bound";
        if (entry.dataKey === "forecast") displayLabel = "Forecast";
        if (entry.dataKey === "price") displayLabel = "Price";

        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="font-mono text-xs" style={{ color }}>
              {displayLabel}:
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color }}>
              {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        );
      })}
      {isPrediction && (
        <p className="font-mono text-[10px] text-cyan-400 mt-2 border-t border-slate-800 pt-2">
          ⚡ Prediction
        </p>
      )}
    </div>
  );
};

/* ----------------------------- Component ----------------------------- */

export function PriceChart({ ticker, onForecastChange }: PriceChartProps) {
  const [forecastDays, setForecastDays] = useState(3);
  const [showBands, setShowBands] = useState(true);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);

  useEffect(() => {
    onForecastChange(forecastDays);
  }, [forecastDays, onForecastChange]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const h = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/history?ticker=${ticker}&days=60`
        );
        const f = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/price/forecast?ticker=${ticker}&days=${forecastDays}`
        );

        const hist = await h.json();
        const pred = await f.json();

        if (alive) {
          setHistory(hist.historicalPrices);
          setForecast(pred.points);
        }
      } finally {
        alive && setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [ticker, forecastDays]);

  const { chartData, predictionStartDate } = useMemo(() => {
    if (!history.length) return { chartData: [], predictionStartDate: null };

    const prices = history.map((p) => p.price);
    const rsi = computeRSI(prices);
    const macd = computeMACD(prices);

    const hist: ChartPoint[] = history.map((p, i) => ({
      date: p.date,
      price: p.price,
      rsi: rsi[i],
      macd: macd[i],
      isPrediction: false,
    }));

    const pred: ChartPoint[] = forecast.map((p) => ({
      date: p.date,
      forecast: Number(p.price), // use backend "price" as forecast line value
      upperBand: Number(p.upper),
      lowerBand: Number(p.lower),
      rangeBase: Number(p.lower),
      rangeTop: Number(p.upper) - Number(p.lower),
      isPrediction: true,
    }));

    if (hist.length > 0 && pred.length > 0) {
      hist[hist.length - 1].forecast = hist[hist.length - 1].price;
    }

    return {
      chartData: [...hist, ...pred],
      predictionStartDate: pred.length > 0 ? pred[0].date : null,
    };
  }, [history, forecast]);

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border border-slate-800 p-6">
        <Skeleton className="h-96 bg-slate-800" />
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm text-slate-400 uppercase">Price Forecast</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <span>Historical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Forecast</span>
            </div>
            {showBands && (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Upper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Lower</span>
                </div>
              </>
            )}
          </div>
          <Toggle
            pressed={showBands}
            onPressedChange={setShowBands}
            className="text-xs font-mono"
          >
            Confidence Bands
          </Toggle>
        </div>
      </div>

      {/* Horizon */}
      <div className="space-y-2">
        <Label className="font-mono text-xs text-slate-400">Prediction Horizon</Label>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setForecastDays((d) => Math.max(1, d - 1))}
          >
            <ChevronDown />
          </Button>
          <Slider
            min={1}
            max={7}
            step={1}
            value={[forecastDays]}
            onValueChange={(v) => setForecastDays(v[0])}
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setForecastDays((d) => Math.min(7, d + 1))}
          >
            <ChevronUp />
          </Button>
          <span className="font-mono text-emerald-400">{forecastDays}d</span>
        </div>
      </div>

      {/* PRICE CHART */}
      <div className="h-96">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} domain={["auto", "auto"]} />
            <Tooltip content={<CustomTooltip />} />

            {predictionStartDate && (
              <ReferenceLine
                x={predictionStartDate}
                stroke="#64748b"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: "Forecast →",
                  position: "top",
                  fill: "#64748b",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              />
            )}

            {showBands && (
              <>
                <Area
                  type="monotone"
                  dataKey="rangeBase"
                  stackId="confidence"
                  stroke="none"
                  fill="transparent"
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="rangeTop"
                  stackId="confidence"
                  stroke="none"
                  fill="url(#colorConfidence)"
                  connectNulls
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="price"
              stroke="#facc15"
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />

            {showBands && (
              <Line
                type="monotone"
                dataKey="lowerBand"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: "#ef4444", r: 3 }}
                connectNulls
              />
            )}

            {showBands && (
              <Line
                type="monotone"
                dataKey="upperBand"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: "#10b981", r: 3 }}
                connectNulls
              />
            )}

            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#22d3ee"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "#22d3ee", r: 5, strokeWidth: 2, stroke: "#164e63" }}
              connectNulls
              activeDot={{ r: 7, strokeWidth: 2, stroke: "#164e63" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="h-36 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-slate-400">RSI (0–100)</Label>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-4 bg-[#38bdf8] rounded-sm" />
              <span>RSI</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-px w-4 bg-red-500 border-dashed border-t border-red-500" />
              <span>Overbought (70)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-px w-4 bg-emerald-500 border-dashed border-t border-emerald-500" />
              <span>Oversold (30)</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
            <Line dataKey="rsi" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div className="h-36 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-slate-400">MACD</Label>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-2 w-4 bg-[#facc15] rounded-sm" />
              <span>MACD Line</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-px w-4 bg-slate-400" />
              <span>Zero Line</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#64748b" />
            <Line dataKey="macd" stroke="#facc15" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
