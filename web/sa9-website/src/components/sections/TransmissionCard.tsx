import Image from "next/image";
import type { Transmission, Accent } from "@/lib/transmissions";

const accentText: Record<Accent, string> = {
  pink: "text-sa9-pink",
  cyan: "text-sa9-cyan",
  green: "text-sa9-green",
  purple: "text-sa9-purple",
  orange: "text-sa9-orange",
  yellow: "text-sa9-yellow",
};

const accentBorderHover: Record<Accent, string> = {
  pink: "hover:border-sa9-pink",
  cyan: "hover:border-sa9-cyan",
  green: "hover:border-sa9-green",
  purple: "hover:border-sa9-purple",
  orange: "hover:border-sa9-orange",
  yellow: "hover:border-sa9-yellow",
};

// Full static literals so Tailwind's source scanner emits them.
const accentGroupHoverText: Record<Accent, string> = {
  pink: "group-hover:text-sa9-pink",
  cyan: "group-hover:text-sa9-cyan",
  green: "group-hover:text-sa9-green",
  purple: "group-hover:text-sa9-purple",
  orange: "group-hover:text-sa9-orange",
  yellow: "group-hover:text-sa9-yellow",
};

const accentTextHover: Record<Accent, string> = {
  pink: "hover:text-sa9-pink",
  cyan: "hover:text-sa9-cyan",
  green: "hover:text-sa9-green",
  purple: "hover:text-sa9-purple",
  orange: "hover:text-sa9-orange",
  yellow: "hover:text-sa9-yellow",
};

const accentBorder: Record<Accent, string> = {
  pink: "border-sa9-pink",
  cyan: "border-sa9-cyan",
  green: "border-sa9-green",
  purple: "border-sa9-purple",
  orange: "border-sa9-orange",
  yellow: "border-sa9-yellow",
};

const accentTileGradient: Record<Accent, string> = {
  pink: "from-sa9-pink/25 via-sa9-surface to-sa9-cyan/10",
  cyan: "from-sa9-cyan/25 via-sa9-surface to-sa9-pink/10",
  green: "from-sa9-green/20 via-sa9-surface to-sa9-cyan/10",
  purple: "from-sa9-purple/25 via-sa9-surface to-sa9-pink/15",
  orange: "from-sa9-orange/25 via-sa9-surface to-sa9-yellow/10",
  yellow: "from-sa9-yellow/20 via-sa9-surface to-sa9-orange/10",
};

const statusLabel: Record<Transmission["status"], string> = {
  streaming: "● NOW STREAMING",
  available: "● AVAILABLE",
  produced: "● PRODUCED",
  "in-production": "○ IN PRODUCTION",
};

/** Typographic cover for transmissions without real art — honest, on-brand. */
function CoverTile({ t }: { t: Transmission }) {
  return (
    <div
      className={`relative w-full aspect-square overflow-hidden bg-gradient-to-br ${accentTileGradient[t.accent]} data-grid-bg flex flex-col justify-between p-5`}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-muted">
        {t.kicker}
      </div>
      <div>
        <div className={`font-display font-black uppercase leading-[0.95] tracking-tight text-2xl sm:text-3xl ${accentText[t.accent]}`}>
          {t.title}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-muted mt-3">
          {t.genre}
        </div>
      </div>
    </div>
  );
}

export function TransmissionCard({ t }: { t: Transmission }) {
  const soon = t.comingSoon;

  return (
    <article
      className={`group relative border-3 border-sa9-border bg-sa9-surface-raised ${accentBorderHover[t.accent]} transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.7)] hover:-translate-y-0.5 flex flex-col`}
    >
      {/* Coming-soon banner stays sharp above the (blurring) content */}
      {soon ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <span
            className={`font-display font-black uppercase tracking-[0.25em] text-sm sm:text-base px-4 py-2 border-3 ${accentBorder[t.accent]} ${accentText[t.accent]} bg-sa9-surface/85`}
          >
            Coming Soon
          </span>
        </div>
      ) : null}

      {/* Content — blurs on hover for coming-soon cards */}
      <div
        className={`flex flex-col flex-1 ${soon ? "transition-[filter] duration-300 group-hover:blur-[5px]" : ""}`}
      >
        <div className="relative w-full aspect-square overflow-hidden border-b-3 border-sa9-border">
          {t.cover ? (
            <Image
              src={t.cover}
              alt={`${t.title} cover art`}
              fill
              className={`object-cover group-hover:scale-[1.03] transition-transform duration-300 ${soon ? "opacity-70" : ""}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <CoverTile t={t} />
          )}
          <div className="absolute top-0 left-0 font-mono text-[10px] uppercase tracking-widest bg-sa9-surface/90 text-sa9-text px-2 py-1 border-r-3 border-b-3 border-sa9-border">
            <span className={accentText[t.accent]}>
              {soon ? "○ COMING SOON" : statusLabel[t.status]}
            </span>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-2 font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim">
            <span>{t.genre}</span>
            {t.episodes ? <span>· {t.episodes} EP</span> : null}
            {t.runtime ? <span>· {t.runtime}</span> : null}
          </div>
          <h3 className={`font-display font-black text-lg uppercase tracking-tight text-sa9-text leading-tight mb-2 ${accentGroupHoverText[t.accent]}`}>
            {t.title}
          </h3>
          <p
            className={`text-sa9-text-muted text-sm leading-relaxed flex-1 ${soon ? "blur-[3px] select-none" : ""}`}
          >
            {t.logline}
          </p>
          {t.comps ? (
            <p
              className={`text-sa9-text-dim text-xs italic mt-3 leading-snug ${soon ? "blur-[3px] select-none" : ""}`}
            >
              {t.comps}
            </p>
          ) : null}

          {soon ? (
            <div className="mt-4 pt-4 border-t-3 border-sa9-border/40 font-mono text-[11px] uppercase tracking-widest text-sa9-text-dim">
              Transmission incoming
            </div>
          ) : t.links.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-3 border-sa9-border/40">
              {t.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-mono text-[11px] uppercase tracking-wide border-3 border-sa9-border px-2.5 py-1 text-sa9-text ${accentBorderHover[t.accent]} ${accentTextHover[t.accent]} transition-colors`}
                >
                  {l.label} →
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t-3 border-sa9-border/40 font-mono text-[11px] uppercase tracking-widest text-sa9-text-dim">
              {t.status === "produced" ? "Release incoming" : "In production"}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
