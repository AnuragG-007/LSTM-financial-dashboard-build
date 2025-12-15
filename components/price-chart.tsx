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

interface ForecastPoint {
  date: string;
  forecast: number;
  lower: number;
  upper: number;
}

interface ChartPoint {
  date: string;
  price?: number;
  forecast?: number;
  lower?: number;
  upper?: number;
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

        if (!h.ok || !f.ok) throw new Error("Chart fetch failed");

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

  const chartData: ChartPoint[] = useMemo(() => {
    if (!history.length) return [];

    const prices = history.map((p) => p.price);
    const rsi = computeRSI(prices);
    const macd = computeMACD(prices);

    const hist = history.map((p, i) => ({
      date: p.date,
      price: p.price,
      rsi: rsi[i],
      macd: macd[i],
      isPrediction: false,
    }));

    const pred = forecast.map((p) => ({
      date: p.date,
      forecast: p.forecast,
      upper: p.upper,
      lower: p.lower,
      isPrediction: true,
    }));

    return [...hist, ...pred];
  }, [history, forecast]);

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-96" />
      </Card>
    );
  }

  /* ----------------------------- Render ----------------------------- */

  return (
    <Card className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm text-slate-400 uppercase">
          Price Forecast
        </h3>
        <Toggle
          pressed={showBands}
          onPressedChange={setShowBands}
          className="text-xs font-mono"
        >
          Confidence Bands
        </Toggle>
      </div>

      {/* Horizon */}
      <div className="space-y-2">
        <Label className="font-mono text-xs text-slate-400">
          Prediction Horizon
        </Label>
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

      {/* PRICE */}
      <div className="h-96">
        <ResponsiveContainer>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />

            {showBands && (
              <Area
                dataKey="upper"
                baseLine="lower"
                fill="rgba(16,185,129,0.15)"
                stroke="none"
              />
            )}

            <Line
              dataKey="price"
              stroke="#facc15"
              dot={false}
              strokeWidth={2}
            />

            <Line
              dataKey="forecast"
              stroke="#10b981"
              strokeDasharray="6 4"
              dot
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      {/* RSI */}
      <div className="h-36 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-slate-400">
            RSI (0–100)
          </Label>

          {/* RSI Legend */}
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
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
            <Line
              dataKey="rsi"
              stroke="#38bdf8"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* MACD */}
      <div className="h-36 space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-mono text-slate-400">MACD</Label>

          {/* MACD Legend */}
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
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#64748b" />
            <Line
              dataKey="macd"
              stroke="#facc15"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
