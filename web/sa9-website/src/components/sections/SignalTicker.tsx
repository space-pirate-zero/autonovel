/**
 * Infinite scrolling signal ticker. Pure CSS marquee (pauses on hover).
 * The item list is duplicated so the -50% translate loops seamlessly.
 */
const ITEMS = [
  "◦ NOW STREAMING: THE LAST HUMAN CEO",
  "◦ SIGNAL FINDS SIGNAL — 24 TRACKS",
  "◦ NO ALGORITHMS. NO NOISE. JUST SHIPPING",
  "◦ 6 PRODUCTS. ZERO VENTURE CAPITAL",
  "◦ DEPLOY ON FRIDAYS",
  "◦ THE TIFFANY LAMP, NOT THE FLUORESCENT TUBE",
  "◦ OSMIX: SUNO IN, A REAL SESSION OUT",
];

export function SignalTicker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-mask relative overflow-hidden border-y-3 border-sa9-border bg-sa9-surface-raised py-3">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span
            key={i}
            className="font-mono text-xs uppercase tracking-[0.2em] text-sa9-text-muted px-6"
          >
            <span className={i % 2 === 0 ? "text-sa9-pink" : "text-sa9-cyan"}>
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
