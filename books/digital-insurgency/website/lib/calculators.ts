// Flagship interactive calculators — hand-encoded from the book's physics so the
// inputs are real and the benchmark bands are meaningful. The other equations
// render as formula cards from content/equations.json. Thresholds are the book's
// traffic-light bands (green = good, red = danger); tune against Appendix A.

export type Band = "green" | "yellow" | "red";
export type Input = { key: string; label: string; min: number; max: number; step: number; default: number };
export type Calc = {
  symbol: string;
  name: string;
  chapter: string;
  blurb: string;
  inputs: Input[];
  compute: (v: Record<string, number>) => number;
  unit?: string;
  // returns band for a computed value; `dir` tells the gauge which end is "good"
  band: (x: number) => Band;
  goodIsLow: boolean;
  meaning: (x: number, b: Band) => string;
};

const slider = (key: string, label: string, min: number, max: number, def: number, step = 1): Input => ({
  key, label, min, max, step, default: def,
});

export const CALCULATORS: Calc[] = [
  {
    symbol: "A_hl",
    name: "Authenticity Half-Life",
    chapter: "1",
    blurb: "How long your work resists being replicated by a machine. Higher is safer.",
    inputs: [
      slider("taste", "Taste", 0, 10, 6),
      slider("context", "Context", 0, 10, 6),
      slider("craft", "Craft", 0, 10, 6),
      slider("repl", "Replicability", 1, 10, 5),
    ],
    compute: (v) => (v.taste + v.context + v.craft) / v.repl,
    band: (x) => (x >= 3 ? "green" : x >= 1.5 ? "yellow" : "red"),
    goodIsLow: false,
    meaning: (x, b) =>
      b === "green"
        ? "Hard to copy. This is a fingerprint the machine can't print."
        : b === "yellow"
        ? "Copyable within a quarter. Add taste, context, or craft."
        : "Already a commodity. A model ships this by Tuesday.",
  },
  {
    symbol: "R_ext",
    name: "Extinction Rate",
    chapter: "1",
    blurb: "How fast generic code goes extinct. Above ~1.5 you're already a fossil.",
    inputs: [
      slider("generic", "Generic lines", 0, 100, 60),
      slider("authentic", "Authentic lines", 1, 100, 40),
      slider("velocity", "AI velocity", 0.5, 5, 2, 0.1),
    ],
    compute: (v) => (v.generic / v.authentic) * v.velocity,
    band: (x) => (x <= 1 ? "green" : x <= 1.5 ? "yellow" : "red"),
    goodIsLow: true,
    meaning: (x, b) =>
      b === "green"
        ? "Mostly authentic. You survive the rewrite."
        : b === "yellow"
        ? "Drifting generic. Shift work toward the fingerprint."
        : "Fossil trajectory — the rewrite comes for this first.",
  },
  {
    symbol: "F_cp",
    name: "Consensus Paralysis",
    chapter: "2",
    blurb: "Communication paths in a decision group — n(n−1)/2. Why big rooms can't decide.",
    inputs: [slider("n", "People in the room", 2, 20, 9)],
    compute: (v) => (v.n * (v.n - 1)) / 2,
    unit: "paths",
    band: (x) => (x <= 10 ? "green" : x <= 28 ? "yellow" : "red"),
    goodIsLow: true,
    meaning: (x, b) =>
      b === "green"
        ? "Small enough to actually decide."
        : b === "yellow"
        ? "Slowing down. Every added person is exponential drag."
        : "Paralyzed. Shrink the deciding group or nothing ships.",
  },
  {
    symbol: "D_comp",
    name: "Tech-Debt Compound Rate",
    chapter: "2",
    blurb: "Bugs found ÷ bugs fixed. Above 1 the debt compounds.",
    inputs: [
      slider("found", "Bugs found / wk", 0, 100, 40),
      slider("fixed", "Bugs fixed / wk", 1, 100, 30),
    ],
    compute: (v) => v.found / v.fixed,
    band: (x) => (x <= 1 ? "green" : x <= 1.5 ? "yellow" : "red"),
    goodIsLow: true,
    meaning: (x, b) =>
      b === "green"
        ? "Paying it down. Debt is shrinking."
        : b === "yellow"
        ? "Underwater and sinking slowly."
        : "Compounding fast — the system is eating your roadmap.",
  },
  {
    symbol: "R_t",
    name: "Theater Ratio",
    chapter: "2",
    blurb: "(Press releases + demo days) ÷ production deploys. How much is show.",
    inputs: [
      slider("press", "Press releases", 0, 20, 6),
      slider("demos", "Demo days", 0, 20, 4),
      slider("deploys", "Production deploys", 1, 40, 10),
    ],
    compute: (v) => (v.press + v.demos) / v.deploys,
    band: (x) => (x <= 0.5 ? "green" : x <= 1 ? "yellow" : "red"),
    goodIsLow: true,
    meaning: (x, b) =>
      b === "green"
        ? "Mostly shipping, little theater."
        : b === "yellow"
        ? "Half the energy is performance."
        : "It's a stage play. Almost nothing reaches production.",
  },
  {
    symbol: "DF",
    name: "Decision Fatigue",
    chapter: "4",
    blurb: "Decisions made ÷ glucose remaining. Why the 4pm 'no' is automatic.",
    inputs: [
      slider("decisions", "Decisions made today", 0, 100, 40),
      slider("glucose", "Glucose remaining (0–10)", 1, 10, 4),
    ],
    compute: (v) => v.decisions / v.glucose,
    band: (x) => (x <= 5 ? "green" : x <= 12 ? "yellow" : "red"),
    goodIsLow: true,
    meaning: (x, b) =>
      b === "green"
        ? "Fresh. Pitch now — they can still say yes."
        : b === "yellow"
        ? "Tiring. The default answer is drifting to 'no'."
        : "Depleted. Every ask gets a reflex 'no'. Come back tomorrow morning.",
  },
];

export const CALC_BY_SYMBOL = Object.fromEntries(CALCULATORS.map((c) => [c.symbol, c]));
