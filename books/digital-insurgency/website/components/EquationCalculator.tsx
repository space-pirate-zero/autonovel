"use client";
import { useState } from "react";
import type { Calc } from "@/lib/calculators";

const BAND_COLOR = { green: "#b6ff3a", yellow: "#ffab00", red: "#ff1744" } as const;

export default function EquationCalculator({ calc }: { calc: Calc }) {
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(calc.inputs.map((i) => [i.key, i.default]))
  );
  const result = calc.compute(vals);
  const band = calc.band(result);
  const color = BAND_COLOR[band];

  // needle position: map result across a sensible 0..(max seen) range for display
  const displayMax = Math.max(result * 1.4, 2);
  const pct = Math.min(100, Math.max(0, (result / displayMax) * 100));
  const needleLeft = calc.goodIsLow ? pct : pct; // gauge is green→red L→R

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold">{calc.name}</h3>
        <code className="font-mono text-xs text-cyan">{calc.symbol} · Ch {calc.chapter}</code>
      </div>
      <p className="mt-1 text-sm text-mut">{calc.blurb}</p>

      <div className="mt-4 space-y-3">
        {calc.inputs.map((inp) => (
          <label key={inp.key} className="block">
            <div className="flex justify-between font-mono text-xs text-mut">
              <span>{inp.label}</span>
              <span className="text-ink">{vals[inp.key]}</span>
            </div>
            <input
              type="range"
              min={inp.min}
              max={inp.max}
              step={inp.step}
              value={vals[inp.key]}
              onChange={(e) => setVals((s) => ({ ...s, [inp.key]: Number(e.target.value) }))}
              className="w-full accent-pink"
            />
          </label>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <span className="kicker">Result</span>
          <span className="font-display text-3xl font-black" style={{ color }}>
            {result.toFixed(2)}
            {calc.unit ? <span className="ml-1 text-sm text-mut">{calc.unit}</span> : null}
          </span>
        </div>
        <div className="gauge-track mt-2">
          <div className="gauge-needle" style={{ left: `${needleLeft}%` }} />
        </div>
        <p className="mt-3 text-sm" style={{ color }}>
          {calc.meaning(result, band)}
        </p>
      </div>
    </div>
  );
}
