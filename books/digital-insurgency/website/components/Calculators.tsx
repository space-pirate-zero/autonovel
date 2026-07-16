"use client";
import EquationCalculator from "@/components/EquationCalculator";
import { CALCULATORS } from "@/lib/calculators";

// Client boundary: import the calculators (which carry functions) here so no
// function ever crosses a server→client prop boundary.
export default function Calculators() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {CALCULATORS.map((c) => (
        <EquationCalculator key={c.symbol} calc={c} />
      ))}
    </div>
  );
}
