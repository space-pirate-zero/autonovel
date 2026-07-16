import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { albums } from "@/lib/music";

export const metadata: Metadata = {
  title: "Music — 6 Albums by Space Pirate Zero",
  description:
    "Six albums from Space Pirate Zero: hip-hop, Latin, alternative, lo-fi cosmic, and synth-pop. Stream on Spotify, Apple Music, and YouTube. From the cosmic underbelly to Saturn's rings.",
  alternates: {
    canonical: "/music",
  },
  openGraph: {
    title: "Space Pirate Zero Music — 6 Albums from the Cosmic Underbelly",
    description:
      "Hip-hop, Latin, alternative, synth-pop. Six albums streaming everywhere. Cosmic lo-fi beats from the outer edge.",
    images: [{ url: "/api/og?title=Music&subtitle=6+Albums+from+the+Cosmic+Underbelly&type=music", width: 1200, height: 630 }],
  },
};

const sorted = [...albums].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function MusicPage() {
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Music", url: "https://spaceshipalpha9.co/music" },
  ]);

  const totalTracks = albums.reduce((acc, a) => acc + a.tracks.length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <Badge variant="cyan" className="mb-4">
            TRANSMISSIONS
          </Badge>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-sa9-text mb-4 leading-[0.9]">
            Music from
            <br />
            <span className="text-sa9-cyan">the Cosmos.</span>
          </h1>
          <p className="text-sa9-text-muted text-lg max-w-2xl mb-6">
            {albums.length} albums. {totalTracks} tracks. Hip-hop, Latin,
            alternative, synth-pop, and lo-fi cosmic. All produced by Space
            Pirate Zero. Streaming everywhere.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="lg">
                SPOTIFY
              </Button>
            </a>
            <a
              href="https://music.apple.com/us/artist/space-pirate-zero/1751347344"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="cyan" size="lg">
                APPLE MUSIC
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ══ ALBUMS ══ */}
      {sorted.map((album, idx) => (
        <AnimatedSection
          key={album.id}
          className={`py-16 sm:py-20 ${idx % 2 === 1 ? "bg-sa9-surface-raised border-y-3 border-sa9-border" : ""}`}
          delay={idx * 80}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Album art */}
              <div className="flex-shrink-0">
                <Link href={`/music/${album.slug}`} className="block group">
                  <div className="relative w-full lg:w-80 aspect-square border-3 border-sa9-border shadow-[6px_6px_0_rgba(0,0,0,0.5)] overflow-hidden group-hover:border-sa9-cyan transition-colors">
                    <Image
                      src={album.image}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  </div>
                </Link>
              </div>

              {/* Album info */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {album.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono uppercase tracking-widest text-sa9-text-dim border border-sa9-border px-1.5 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={`/music/${album.slug}`} className="group/title">
                  <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-1 group-hover/title:text-sa9-cyan transition-colors">
                    {album.title}
                  </h2>
                </Link>
                <div className="font-mono text-xs text-sa9-text-dim mb-4">
                  {formatDate(album.date)} &middot; {album.tracks.length} tracks
                </div>
                <p className="text-sa9-text-muted leading-relaxed mb-6 max-w-xl">
                  {album.description}
                </p>

                {/* Apple Music embed player */}
                <div className="mb-6 border-3 border-sa9-border overflow-hidden">
                  <iframe
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    frameBorder="0"
                    height="450"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                    src={`${album.appleMusicEmbed}?theme=dark`}
                    style={{ width: "100%", overflow: "hidden", borderRadius: 0, background: "transparent" }}
                    title={`${album.title} — Apple Music`}
                  />
                </div>

                {/* Stream links */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`/music/${album.slug}`}>
                    <Button variant="cyan" size="sm">
                      VIEW ALBUM →
                    </Button>
                  </Link>
                  <a
                    href={album.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm">
                      SPOTIFY
                    </Button>
                  </a>
                  <a
                    href={album.appleMusic}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      APPLE MUSIC
                    </Button>
                  </a>
                  {album.youtube && (
                    <a
                      href={album.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        YOUTUBE
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      ))}

      {/* ══ CTA ══ */}
      <section className="border-t-3 border-sa9-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Follow the <span className="text-sa9-cyan">signal</span>.
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            New transmissions drop without warning. Follow Space Pirate Zero on
            your platform of choice.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="lg">
                FOLLOW ON SPOTIFY
              </Button>
            </a>
            <Link href="/dispatches">
              <Button variant="secondary" size="lg">
                READ DISPATCHES
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
