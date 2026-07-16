import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllContent } from '@/lib/content-loader';
import { MusicContent } from '@/types/content';

const BASE_URL = 'https://www.spacepiratezero.com';
const OG_IMAGE = `${BASE_URL}/api/og?title=Music&subtitle=Albums+%26+EPs+from+Space+Pirate+Zero&type=music`;

export const metadata: Metadata = {
  title: 'Music // Space Pirate Zero',
  description:
    'Albums and EPs by Space Pirate Zero. Cosmic hip-hop, Latin alternative, lo-fi transmissions, and interstellar bossa nova.',
  alternates: { canonical: `${BASE_URL}/content/music` },
  openGraph: {
    title: 'Music // Space Pirate Zero',
    description: 'Albums and EPs by Space Pirate Zero.',
    url: `${BASE_URL}/content/music`,
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Space Pirate Zero Music' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music // Space Pirate Zero',
    description: 'Albums and EPs by Space Pirate Zero.',
    images: [OG_IMAGE],
  },
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export default async function MusicArchivePage() {
  const allContent = await getAllContent();
  const albums = (allContent.filter((item) => item.type === 'Music') as MusicContent[]).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <main className="pt-16">
      {/* ── HERO ── */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,255,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-sa9-cyan/60 mb-4">
            DISCOGRAPHY // FULL_ARCHIVE
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-[0.9] mb-6">
            Transmissions from
            <br />
            <span className="text-sa9-cyan">the Outer Edge.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {albums.length} album{albums.length !== 1 ? 's' : ''} and EPs from Space Pirate Zero.
            Cosmic hip-hop, Latin alternative, lo-fi fever dreams, and interstellar bossa nova.
          </p>
        </div>
      </section>

      {/* ── ALBUM GRID ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {albums.length === 0 ? (
            <p className="text-white/40 font-mono text-sm">No transmissions archived yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/content/music/${album.slug}`}
                  className="group border border-white/10 bg-white/[0.02] hover:border-sa9-cyan/50 hover:bg-white/[0.04] transition-all duration-150 flex flex-col"
                >
                  <div className="relative w-full aspect-square overflow-hidden border-b border-white/10">
                    <Image
                      src={album.coverImage}
                      alt={album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {album.topicTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono uppercase tracking-[0.2em] text-sa9-cyan/60 border border-sa9-cyan/20 px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-headline font-bold text-base uppercase tracking-wider text-white group-hover:text-sa9-cyan transition-colors mb-1">
                      {album.title}
                    </h2>
                    <p className="text-white/50 text-sm line-clamp-2 mb-3 flex-1">
                      {album.description}
                    </p>
                    <div className="flex items-center justify-between font-mono text-[10px] text-white/30">
                      <span>{formatDate(album.timestamp)}</span>
                      <span>{album.tracks.length} tracks</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
