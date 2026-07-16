import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllContent } from '@/lib/content-loader';
import { ArticleContent } from '@/types/content';

const BASE_URL = 'https://www.spacepiratezero.com';
const OG_IMAGE = `${BASE_URL}/api/og?title=Press&subtitle=Press+Coverage+%26+Features&type=press`;

export const metadata: Metadata = {
  title: 'Press // Space Pirate Zero',
  description:
    'Press coverage, interviews, video features, and media appearances by Greg Chambers (Space Pirate Zero).',
  alternates: { canonical: `${BASE_URL}/content/press` },
  openGraph: {
    title: 'Press // Space Pirate Zero',
    description: 'Press coverage and media appearances by Space Pirate Zero.',
    url: `${BASE_URL}/content/press`,
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Space Pirate Zero Press' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Press // Space Pirate Zero',
    description: 'Press coverage and media appearances.',
    images: [OG_IMAGE],
  },
};

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function PressArchivePage() {
  const allContent = await getAllContent();
  const pressItems = (allContent.filter(
    (item) => item.type === 'Article' && (item.subtype === 'press' || item.subtype === 'video_press' || item.subtype === 'video-press' || item.subtype === 'video press')
  ) as ArticleContent[]).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <main className="pt-16">
      {/* ── HERO ── */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,128,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber-magenta/60 mb-4">
            PRESS_COVERAGE // FULL_ARCHIVE
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-[0.9] mb-6">
            Press &amp;
            <br />
            <span className="text-cyber-magenta">Media.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {pressItems.length} press feature{pressItems.length !== 1 ? 's' : ''}, interviews, and media appearances.
          </p>
        </div>
      </section>

      {/* ── PRESS LIST ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {pressItems.length === 0 ? (
            <p className="text-white/40 font-mono text-sm">No press coverage archived yet.</p>
          ) : (
            <div className="space-y-px">
              {pressItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/press/${item.slug}`}
                  className="group flex items-start gap-6 border border-white/[0.06] bg-white/[0.01] hover:border-cyber-magenta/30 hover:bg-white/[0.03] p-5 transition-all duration-150"
                >
                  <div className="hidden sm:block relative w-20 h-20 flex-shrink-0 overflow-hidden border border-white/10">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {item.youtube_id && (
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-sa9-cyan/60 border border-sa9-cyan/20 px-1.5 py-0.5">
                          VIDEO
                        </span>
                      )}
                      {item.topicTags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 border border-white/10 px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                      <span className="font-mono text-[9px] text-white/25">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-white/80 group-hover:text-cyber-magenta transition-colors truncate mb-1">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-xs line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <span className="hidden sm:block text-white/20 group-hover:text-cyber-magenta transition-colors text-lg flex-shrink-0 mt-1">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
