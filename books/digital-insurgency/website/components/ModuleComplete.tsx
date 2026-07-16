"use client";
import { useProgress } from "@/lib/progress";
import { motion } from "framer-motion";

export default function ModuleComplete({ ep, next }: { ep: number; next?: string }) {
  const { progress, actions, pct } = useProgress();
  const done = progress.read.includes(ep);

  return (
    <div className="my-10 flex flex-col items-center gap-3 rounded-xl border border-line bg-panel/50 p-6 text-center">
      <motion.button
        onClick={() => actions.toggleRead(ep)}
        whileTap={{ scale: 0.94 }}
        className={`btn ${done ? "btn-pink" : ""}`}
      >
        {done ? "✓ Module complete" : "Mark this module complete"}
      </motion.button>
      <p className="font-mono text-xs text-mut">
        Course progress: <span className="text-cyan">{pct}%</span> · the portrait heals with every module.
      </p>
      {done && next && (
        <a href={next} className="text-sm text-cyan hover:underline">Next module →</a>
      )}
    </div>
  );
}
