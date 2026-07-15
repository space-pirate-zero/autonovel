import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { breadcrumbJsonLd, musicAlbumJsonLd } from "@/lib/structured-data";
import { albums } from "@/lib/music";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return albums.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = albums.find((a) => a.slug === slug);
  if (!album) return { title: "Not Found" };

  return {
    title: `${album.title} — Space Pirate Zero`,
    description: album.description,
    alternates: { canonical: `/music/${album.slug}` },
    openGraph: {
      title: `${album.title} — Space Pirate Zero`,
      description: album.description,
      images: [{ url: album.image, width: 640, height: 640, alt: album.title }],
      type: "music.album",
    },
    twitter: {
      card: "summary_large_image",
      title: `${album.title} — Space Pirate Zero`,
      description: album.description,
      images: [album.image],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = albums.find((a) => a.slug === slug);
  if (!album) notFound();

  const albumIndex = albums.findIndex((a) => a.slug === slug);
  const prev = albums[albumIndex + 1] ?? null;
  const next = albums[albumIndex - 1] ?? null;

  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", url: "https://spaceshipalpha9.co" },
    { name: "Music", url: "https://spaceshipalpha9.co/music" },
    { name: album.title, url: `https://spaceshipalpha9.co/music/${album.slug}` },
  ]);

  const albumSchema = musicAlbumJsonLd(album);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(albumSchema) }}
      />

      {/* ══ BREADCRUMB ══ */}
      <nav className="border-b-3 border-sa9-border bg-sa9-surface-raised">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 font-mono text-xs text-sa9-text-dim">
            <Link href="/" className="hover:text-sa9-text transition-colors">HOME</Link>
            <span>/</span>
            <Link href="/music" className="hover:text-sa9-text transition-colors">MUSIC</Link>
            <span>/</span>
            <span className="text-sa9-text uppercase">{album.title}</span>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative border-b-3 border-sa9-border overflow-hidden">
        <div className="absolute inset-0 data-grid-bg" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Album art */}
            <div className="flex-shrink-0">
              <div className="relative w-full max-w-xs lg:w-72 aspect-square border-3 border-sa9-border shadow-[8px_8px_0_rgba(0,0,0,0.6)] overflow-hidden mx-auto lg:mx-0">
                <Image
                  src={album.image}
                  alt={album.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 320px, 288px"
                  priority
                />
              </div>
            </div>

            {/* Album info */}
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {album.tags.map((tag) => (
                  <Badge key={tag} variant="cyan">{tag.toUpperCase()}</Badge>
                ))}
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-sa9-text mb-2 leading-tight">
                {album.title}
              </h1>
              <div className="font-mono text-sm text-sa9-text-dim mb-4">
                {formatDate(album.date)} &middot; {album.tracks.length} tracks &middot; Space Pirate Zero
              </div>
              <p className="text-sa9-text-muted text-lg leading-relaxed mb-8 max-w-xl">
                {album.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={album.spotify} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg">SPOTIFY</Button>
                </a>
                <a href={album.appleMusic} target="_blank" rel="noopener noreferrer">
                  <Button variant="cyan" size="lg">APPLE MUSIC</Button>
                </a>
                {album.youtube && (
                  <a href={album.youtube} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="lg">YOUTUBE</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLAYER ══ */}
      <AnimatedSection className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-1 h-10 bg-sa9-cyan flex-shrink-0 mt-1" />
            <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
              Listen Now
            </h2>
          </div>
          <div className="border-3 border-sa9-border overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.5)]">
            <iframe
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              frameBorder="0"
              height="450"
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src={`${album.appleMusicEmbed}?theme=dark`}
              style={{ width: "100%", overflow: "hidden", borderRadius: 0, background: "transparent" }}
              title={`${album.title} — Apple Music Player`}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* ══ TRACKLIST ══ */}
      <AnimatedSection className="border-y-3 border-sa9-border bg-sa9-surface-raised py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-1 h-10 bg-sa9-pink flex-shrink-0 mt-1" />
            <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
              Tracklist
              <span className="font-mono text-xs text-sa9-text-dim ml-3">({album.tracks.length})</span>
            </h2>
          </div>
          <div className="space-y-1">
            {album.tracks.map((track, idx) => (
              <div
                key={track.title}
                className="flex items-center gap-4 px-4 py-3 border border-sa9-border/50 hover:border-sa9-cyan hover:bg-sa9-surface transition-all duration-150 group"
              >
                <span className="font-mono text-xs text-sa9-text-dim w-6 text-right flex-shrink-0 group-hover:text-sa9-cyan transition-colors">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span className="font-display font-bold text-sm uppercase tracking-wide text-sa9-text flex-1 group-hover:text-sa9-cyan transition-colors">
                  {track.title}
                </span>
                <span className="font-mono text-xs text-sa9-text-dim flex-shrink-0">
                  {track.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ══ MORE ALBUMS ══ */}
      {(prev || next) && (
        <AnimatedSection className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-1 h-10 bg-sa9-pink flex-shrink-0 mt-1" />
              <h2 className="font-display font-bold text-xl uppercase tracking-widest text-sa9-text">
                More Transmissions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[prev, next].filter(Boolean).map((a) => a && (
                <Link
                  key={a.id}
                  href={`/music/${a.slug}`}
                  className="group flex items-center gap-4 border-3 border-sa9-border bg-sa9-surface-raised hover:border-sa9-cyan p-4 transition-all duration-150 shadow-[4px_4px_0_rgba(0,0,0,0.5)] hover:shadow-[6px_6px_0_rgba(0,240,255,0.2)]"
                >
                  <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden border-2 border-sa9-border">
                    <Image src={a.image} alt={a.title} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[10px] text-sa9-text-dim uppercase tracking-widest mb-1">
                      {formatDate(a.date)}
                    </div>
                    <div className="font-display font-bold text-sm uppercase tracking-wide text-sa9-text group-hover:text-sa9-cyan transition-colors truncate">
                      {a.title}
                    </div>
                    <div className="font-mono text-xs text-sa9-text-dim">
                      {a.tracks.length} tracks
                    </div>
                  </div>
                  <span className="text-sa9-text-dim group-hover:text-sa9-cyan transition-colors text-lg">&#x2192;</span>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* ══ CTA ══ */}
      <section className="border-t-3 border-sa9-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-sa9-text mb-4">
            Follow the <span className="text-sa9-cyan">signal</span>.
          </h2>
          <p className="text-sa9-text-muted text-lg mb-8">
            New transmissions drop without warning. Follow Space Pirate Zero everywhere.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg">FOLLOW ON SPOTIFY</Button>
            </a>
            <Link href="/music">
              <Button variant="secondary" size="lg">ALL ALBUMS</Button>
            </Link>
            <Link href="/dispatches">
              <Button variant="ghost" size="lg">READ DISPATCHES</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
