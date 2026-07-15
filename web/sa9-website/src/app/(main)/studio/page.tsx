import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TransmissionCard } from "@/components/sections/TransmissionCard";
import { TrailerPlayer } from "@/components/sections/TrailerPlayer";
import { transmissions, streamingNow } from "@/lib/transmissions";
import { dispatches } from "@/lib/dispatches";

export const metadata: Metadata = {
  title: "The Studio — Stories & Dispatches from Spaceship Alpha 9",
  keywords: ["AI storytelling studio","full-cast audiobook","audio drama","The Last Human CEO","Space Pirate Zero","investigative AI writing","dispatches","original IP","podcast","Atlanta studio"],
  description:
    "The premier AI storytelling studio in the South — a full-cast audiobook streaming now, a 24-door audio drama, a field course, a 24-track album, plus investigative AI dispatches. Every release a Space Pirate Zero transmission.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  const latestDispatches = [...dispatches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden border-b-3 border-sa9-border">
        <div className="absolute inset-0 bg-gradient-to-b from-sa9-cyan/[0.05] via-transparent to-sa9-pink/[0.04]" />
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Badge variant="cyan">THE STORYTELLING STUDIO</Badge>
            <Badge variant="pink">STREAMING NOW</Badge>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-[0.92] mb-6 max-w-4xl">
            <span className="text-sa9-text">Transmissions from</span>{" "}
            <span className="text-sa9-cyan animate-cyan-pulse">the ship</span>
          </h1>
          <p className="text-sa9-text-muted text-lg sm:text-xl max-w-2xl leading-relaxed mb-2">
            Spaceship Alpha 9 is the premier AI storytelling studio in the South
            — original IP across audiobook, audio drama, nonfiction, and music.
            Greg architects the intelligence; Daniela engineers the empathy.
          </p>
          <p className="font-mono text-sm text-sa9-pink tracking-wide">
            {"// every release is a Space Pirate Zero transmission."}
          </p>
        </div>
      </section>

      {/* ══ NOW STREAMING — the two live series ══ */}
      <AnimatedSection className="py-20 sm:py-24 border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <span className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-cyan animate-cyan-pulse">
              ● Now Streaming
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {streamingNow.map((t) => (
              <div
                key={t.id}
                className="border-3 border-sa9-border bg-sa9-surface p-6 sm:p-8 shadow-[6px_6px_0_rgba(0,0,0,0.6)] flex flex-col sm:flex-row gap-6"
              >
                <div className="relative w-full sm:w-52 lg:w-60 aspect-square flex-shrink-0 border-3 border-sa9-border overflow-hidden bg-sa9-surface">
                  {t.cover ? (
                    <TrailerPlayer
                      cover={t.cover}
                      trailer={t.trailer}
                      title={t.title}
                      accent={t.accent === "cyan" ? "#00f0ff" : "#ff1493"}
                    />
                  ) : null}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim mb-2">
                    {t.genre} · {t.episodes} EP{t.runtime ? ` · ${t.runtime}` : ""}
                  </div>
                  <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-sa9-text leading-tight mb-3">
                    {t.title}
                  </h3>
                  <p className="text-sa9-text-muted text-sm leading-relaxed flex-1">
                    {t.description}
                  </p>
                  {t.comps ? (
                    <p className="text-sa9-text-dim text-xs italic mt-3">
                      {t.comps}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 mt-5">
                    {t.links.map((l) => (
                      <a
                        key={l.href}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant={t.accent === "cyan" ? "cyan" : "primary"}
                          size="sm"
                        >
                          {l.label} →
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ THE FULL SLATE ══ */}
      <AnimatedSection className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="pink" className="mb-4">
            THE FULL SLATE
          </Badge>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-3">
            Every <span className="text-sa9-pink">transmission</span>
          </h2>
          <p className="text-sa9-text-muted text-lg max-w-2xl mb-12 leading-relaxed">
            {transmissions.length} works and counting — audiobook, audio drama,
            nonfiction field course, field manual, and album.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transmissions.map((t) => (
              <TransmissionCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ DISPATCHES (the writing arm of the studio) ══ */}
      <AnimatedSection className="py-20 sm:py-28 border-t-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <Badge variant="cyan" className="mb-4">
                DISPATCHES
              </Badge>
              <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-sa9-text mb-3">
                The <span className="text-sa9-cyan">writing</span> arm
              </h2>
              <p className="text-sa9-text-muted text-lg max-w-2xl leading-relaxed">
                Investigative AI journalism, cybersecurity deep-dives, and gonzo
                dispatches from the outer edge — {latestDispatches.length > 0 ? `${dispatches.length} and counting.` : "published on Substack."}
              </p>
            </div>
            <Link href="/dispatches" className="shrink-0">
              <Button variant="ghost" size="md">
                READ ALL DISPATCHES →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestDispatches.map((d) => (
              <Link
                key={d.slug}
                href={`/dispatches/${d.slug}`}
                className="group border-3 border-sa9-border bg-sa9-surface p-6 shadow-[4px_4px_0_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5 hover:border-sa9-cyan hover:shadow-[6px_6px_0_#006680] flex flex-col"
              >
                <div className="flex flex-wrap items-center gap-2 mb-3 font-mono text-[10px] uppercase tracking-widest text-sa9-text-dim">
                  <time dateTime={d.date}>
                    {new Date(d.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  {d.readingTime ? <span>· {d.readingTime} min read</span> : null}
                </div>
                <h3 className="font-display font-bold text-lg uppercase tracking-tight text-sa9-text mb-2 leading-tight group-hover:text-sa9-cyan transition-colors">
                  {d.title}
                </h3>
                <p className="text-sa9-text-muted text-sm leading-relaxed line-clamp-3 flex-1">
                  {d.summary || d.description}
                </p>
                {d.tags?.length ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {d.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="stack-badge text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ CTA ══ */}
      <section className="border-t-3 border-sa9-border py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            New transmissions, <span className="text-sa9-cyan">as they drop</span>
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            The studio ships stories the way it ships software — often, and
            without asking permission.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/music">
              <Button variant="secondary" size="lg">
                THE DISCOGRAPHY →
              </Button>
            </Link>
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cyan" size="lg">
                SUBSCRIBE ON SUBSTACK →
              </Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
