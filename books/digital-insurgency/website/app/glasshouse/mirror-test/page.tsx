"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useProgress } from "@/lib/progress";

// Seed Mirror Test — the MirrorMatch scenario from the Prologue.
const OPTIONS = [
  { id: "gradient", label: "The engagement graph is up and to the right", correct: false,
    why: "That's the gradient — the pretty face. Look under it." },
  { id: "delay", label: "MATCH_DELAY_ENGINE tunes the wait for free users", correct: true,
    why: "Right. The delay is tuned, not random — it manufactures loneliness to sell relief. That's the engine." },
  { id: "webby", label: "The app won a Webby", correct: false,
    why: "The award is part of the beauty. Beauty is the prerequisite for the rot, not the rot itself." },
  { id: "uptime", label: "99.9% uptime on the match service", correct: false,
    why: "Uptime is neutral. Keep looking at what the service is optimizing for." },
];

export default function MirrorTest() {
  const [flipped, setFlipped] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const chosen = OPTIONS.find((o) => o.id === picked);
  const passed = chosen?.correct;
  const { actions } = useProgress();
  useEffect(() => {
    if (passed) actions.markPassed("mirror-01");
  }, [passed, actions]);

  return (
    <div className="py-12">
      <Link href="/glasshouse" className="font-mono text-xs text-cyan hover:underline">← the Glass House</Link>
      <div className="mt-4 kicker">Mirror Test 01 · MirrorMatch</div>
      <h1 className="mt-2 font-display text-3xl font-black neon-pink">Flip it. Find the rot.</h1>
      <p className="mt-2 max-w-xl text-mut">
        Here is a beautiful product. Before you&apos;d ever ship on top of it, you look at what
        you&apos;re shipping. Flip it over.
      </p>

      {/* the product / engine */}
      <div className="mt-8 max-w-xl">
        {!flipped ? (
          <div className="card p-8 text-center">
            <div className="text-sm text-mut">MirrorMatch — Public Dashboard</div>
            <div className="mt-4 font-display text-5xl font-black neon-cyan">+340%</div>
            <div className="text-sm text-mut">engagement · 47M users · a green line climbing out of frame</div>
            <div className="mt-6 h-24 rounded-lg bg-gradient-to-tr from-acid/10 to-acid/40" />
            <button onClick={() => setFlipped(true)} className="btn btn-pink mt-6">
              Look at the engine ↻
            </button>
          </div>
        ) : (
          <div className="card border-danger/40 p-6" style={{ borderColor: "rgba(255,23,68,.4)" }}>
            <div className="font-mono text-sm text-danger">MirrorMatch — Floor B2 (hidden)</div>
            <ul className="mt-3 space-y-1 font-mono text-sm text-danger">
              <li>LONELINESS_EXPLOITATION_INDEX: 0.84</li>
              <li>ADDICTION_RETENTION_COEFFICIENT: rising</li>
              <li>MATCH_DELAY_ENGINE: ENABLED</li>
            </ul>
            <p className="mt-4 text-sm text-mut">
              Now name it. Which one is the engine — the load-bearing wall the beauty exists to
              pay for?
            </p>
            <div className="mt-4 grid gap-2">
              {OPTIONS.map((o) => (
                <button key={o.id} onClick={() => setPicked(o.id)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${
                    picked === o.id
                      ? o.correct ? "border-acid text-acid" : "border-danger text-danger"
                      : "border-line hover:border-cyan/50"
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* verdict */}
      {chosen && (
        <div className="mt-6 max-w-xl">
          <div className={`card p-5 ${passed ? "" : ""}`} style={{ borderColor: passed ? "#b6ff3a55" : "#ff174455" }}>
            <div className="kicker" style={{ color: passed ? "#b6ff3a" : "#ff1744" }}>
              {passed ? "GHOST // pass" : "REAPER // not yet"}
            </div>
            <p className="mt-2 text-sm">{chosen.why}</p>
            {passed && (
              <p className="mt-3 text-sm text-mut">
                The portrait heals a notch. Fourteen modules of this and it&apos;s whole.{" "}
                <Link href="/glasshouse" className="text-cyan hover:underline">Back to the lab →</Link>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
