"use client";
import { motion } from "framer-motion";

// Minimal on-brand audio player for the episode sample.
export default function AudioPlayer({ src, label }: { src: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 rounded-xl border border-cyan/40 bg-panel/60 p-5 scanline relative overflow-hidden"
    >
      <div className="kicker mb-2">▸ Listen — {label}</div>
      <audio controls preload="none" className="w-full">
        <source src={src} type="audio/mpeg" />
      </audio>
      <p className="mt-2 font-mono text-[11px] text-mut">
        Multi-voice sample (SPZ + ZERO), section-scored. The full 14-episode audiobook renders here.
      </p>
    </motion.div>
  );
}
