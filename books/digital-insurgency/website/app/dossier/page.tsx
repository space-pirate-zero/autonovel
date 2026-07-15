"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useProgress, RANKS } from "@/lib/progress";
import modules from "@/content/modules.json";

const RANK_ART = [
  "/art/extra/01_rank-1-decorator.png", "/art/extra/02_rank-2-wedge.png",
  "/art/extra/03_rank-3-curator.png", "/art/extra/04_rank-4-insurgent.png",
  "/art/extra/05_rank-5-ghost.png",
];

export default function Dossier() {
  const { progress, actions, pct, index, rank, rankIdx, readCount, total } = useProgress();

  return (
    <div className="py-12">
      <div className="kicker">Your dossier</div>
      <h1 className="mt-2 font-display text-4xl font-black">The Insurgent&apos;s Record</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-[320px_1fr]">
        {/* healing portrait */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line">
            <Image src="/art/site/04_portrait-rotted.png" alt="" fill className="object-cover" />
            <motion.div className="absolute inset-0" initial={false} animate={{ opacity: pct / 100 }} transition={{ duration: 0.6 }}>
              <Image src="/art/site/05_portrait-healed.png" alt="" fill className="object-cover" />
            </motion.div>
          </div>
          <p className="mt-2 text-center font-mono text-xs text-mut">
            The portrait heals — <span className="text-cyan">{pct}%</span>
          </p>
        </div>

        {/* stats */}
        <div className="space-y-4">
          <div className="card flex items-center gap-4 p-5">
            <Image src={RANK_ART[rankIdx]} alt="" width={64} height={64} className="float" />
            <div>
              <div className="kicker">Current rank</div>
              <div className="font-display text-2xl font-black neon-pink">{rank}</div>
              <div className="font-mono text-xs text-mut">
                {RANKS.map((r, i) => (
                  <span key={r} className={i <= rankIdx ? "text-cyan" : ""}>{r}{i < 4 ? " › " : ""}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Modules" value={`${readCount}/${total}`} />
            <Stat label="Insurgent Index" value={String(index)} />
            <Stat label="Oath" value={progress.oath ? "Signed" : "—"} />
          </div>

          <Link href="/badge" className="btn btn-pink">
            {readCount >= total && progress.oath ? "Get your credential →" : "Keep going →"}
          </Link>
          <button onClick={() => actions.reset()} className="ml-3 font-mono text-xs text-mut hover:text-danger">
            reset progress
          </button>
        </div>
      </div>

      {/* module checklist */}
      <h2 className="mt-12 font-display text-2xl font-bold">Modules</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {modules.map((m) => {
          const done = progress.read.includes(m.ep);
          return (
            <div key={m.ep} className={`flex items-center gap-3 rounded-lg border p-3 ${done ? "border-acid/40" : "border-line"}`}>
              <button onClick={() => actions.toggleRead(m.ep)} className={done ? "text-acid" : "text-mut"}>
                {done ? "✓" : "○"}
              </button>
              <Link href={`/read/${m.slug}`} className="flex-1 text-sm hover:text-cyan">
                <span className="font-mono text-xs text-mut">EP{String(m.ep).padStart(2, "0")}</span> {m.title}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="kicker">{label}</div>
      <div className="mt-1 font-display text-xl font-black neon-cyan">{value}</div>
    </div>
  );
}
