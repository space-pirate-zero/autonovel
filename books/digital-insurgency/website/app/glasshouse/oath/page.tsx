"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress } from "@/lib/progress";

const OATH = [
  "I will build what is real, even when landfill ships faster.",
  "I will bypass the immune system, never fight it head-on.",
  "I will make good trouble — the quiet kind that outlives the building.",
  "I will look at the engine, not the gradient.",
  "I will heal the portrait four percent at a time.",
];

export default function Oath() {
  const { progress, actions, complete, pct } = useProgress();
  const [checked, setChecked] = useState<boolean[]>(Array(5).fill(false));
  const [name, setName] = useState(progress.name || "");
  const allChecked = checked.every(Boolean);
  const signed = progress.oath;

  return (
    <div className="py-12">
      <Link href="/glasshouse" className="font-mono text-xs text-cyan hover:underline">← the Glass House</Link>
      <div className="mt-4 kicker">The final gate</div>
      <h1 className="mt-2 font-display text-4xl font-black">
        The <span className="neon-pink pulse-glow">Insurgent&apos;s Oath</span>
      </h1>
      <p className="mt-3 max-w-xl text-mut">
        Five commitments. You take them before you close the book. Signing the Oath unlocks
        your credential.
      </p>

      <div className="mt-8 max-w-xl space-y-3">
        {OATH.map((line, i) => (
          <motion.label
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
              checked[i] ? "border-acid/60 bg-acid/5" : "border-line hover:border-cyan/40"
            }`}
          >
            <input
              type="checkbox"
              checked={checked[i]}
              disabled={signed}
              onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
              className="mt-1 accent-acid"
            />
            <span className="text-sm">
              <span className="font-mono text-cyan">{i + 1}.</span> {line}
            </span>
          </motion.label>
        ))}
      </div>

      {!signed ? (
        <div className="mt-6 max-w-xl">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sign with your name…"
            className="w-full rounded-lg border border-line bg-panel px-4 py-3 font-mono text-sm outline-none focus:border-cyan"
          />
          <motion.button
            disabled={!allChecked || !name.trim()}
            onClick={() => actions.signOath(name.trim())}
            whileTap={{ scale: 0.96 }}
            className="btn btn-pink mt-4 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Sign the Oath
          </motion.button>
          {!complete && (
            <p className="mt-3 font-mono text-xs text-mut">
              Note: you can sign now, but the credential also needs all 14 modules complete
              (you&apos;re at {pct}%).
            </p>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 max-w-xl rounded-xl border border-acid/50 bg-acid/5 p-6"
        >
          <div className="kicker" style={{ color: "#b6ff3a" }}>Oath signed</div>
          <p className="mt-2 text-sm">
            Signed by <span className="font-bold text-ink">{progress.name}</span>. The rebellion was
            never the point. Being right was the point.
          </p>
          <Link href="/badge" className="btn btn-pink mt-4">Get your credential →</Link>
        </motion.div>
      )}
    </div>
  );
}
