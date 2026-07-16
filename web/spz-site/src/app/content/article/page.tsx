import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllContent } from '@/lib/content-loader';
import { Footer } from '@/components/hud/Footer';
import { ArticleContent } from '@/types/content';

const BASE_URL = 'https://www.spacepiratezero.com';
const OG_IMAGE = `${BASE_URL}/api/og?title=Dispatches&subtitle=Investigative+AI+Writing+%E2%80%94+Space+Pirate+Zero&type=article`;

export const metadata: Metadata = {
  title: 'Dispatches // Investigative AI Writing — Space Pirate Zero',
  description:
    'Investigative AI writing, cybersecurity deep-dives, dark web exposés, and cultural criticism from Greg Chambers (Space Pirate Zero). Full archives. No paywalls.',
  keywords: [
    'Space Pirate Zero dispatches',
    'investigative AI writing',
    'cybersecurity articles',
    'Greg Chambers writing',
    'AI journalism',
    'enterprise AI',
    'dark web investigations',
  ],
  alternates: {
    canonical: `${BASE_URL}/content/article`,
  },
  openGraph: {
    title: 'Dispatches // Investigative AI Writing — Space Pirate Zero',
    description:
      'Full archive of dispatches on AI, cybersecurity, and cultural criticism. Written by Greg Chambers.',
    url: `${BASE_URL}/content/article`,
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Space Pirate Zero Dispatches' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dispatches // Space Pirate Zero',
    description: 'Investigative AI writing, cybersecurity deep-dives, and cultural criticism.',
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

export default async function ArticleArchivePage() {
  const allContent = await getAllContent();
  const articles = (allContent.filter(
    (item) => item.type === 'Article' && item.subtype === 'article'
  ) as ArticleContent[]).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const featured = articles.slice(0, 3);
  const rest = articles.slice(3);
  return (
    <>
      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,128,0.05),transparent_60%)]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber-magenta/60 mb-4">
              SUBSTACK_DISPATCHES // FULL_ARCHIVE
            </div>
            <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-[0.9] mb-6">
              Dispatches from
              <br />
              <span className="text-cyber-magenta">the Outer Edge.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mb-8">
              {articles.length} dispatches on AI, cybersecurity, dark web investigations,
              cultural criticism, and the occasional leg of lamb. Written by Space Pirate Zero.
            </p>
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyber-magenta text-black font-headline font-bold text-sm uppercase tracking-widest hover:bg-cyber-magenta/80 transition-colors"
            >
              SUBSCRIBE ON SUBSTACK ↗
            </a>
          </div>
        </section>

        {/* ── FEATURED ── */}
        {featured.length > 0 && (
          <section className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber-magenta/60 mb-8">
                LATEST_TRANSMISSIONS
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {featured.map((article) => (
                  <Link
                    key={article.id}
                    href={`/content/article/${article.slug}`}
                    className="group border border-white/10 bg-white/[0.02] hover:border-cyber-magenta/50 hover:bg-white/[0.04] transition-all duration-150 flex flex-col"
                  >
                    <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-white/10">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {article.topicTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyber-magenta/60 border border-cyber-magenta/20 px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="font-headline font-bold text-base uppercase tracking-wider text-white group-hover:text-cyber-magenta transition-colors mb-2 flex-1">
                        {article.title}
                      </h2>
                      <p className="text-white/50 text-sm line-clamp-2 mb-4">
                        {article.description}
                      </p>
                      <div className="font-mono text-[10px] text-white/30">
                        {formatDate(article.timestamp)}
                        {article.readingTime ? ` · ${article.readingTime} min read` : ''}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ARCHIVE LIST ── */}
        {rest.length > 0 && (
          <section className="border-t border-white/10 py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-8">
                ARCHIVE // {rest.length} TRANSMISSIONS
              </div>
              <div className="space-y-px">
                {rest.map((article) => (
                  <Link
                    key={article.id}
                    href={`/content/article/${article.slug}`}
                    className="group flex items-start gap-6 border border-white/[0.06] bg-white/[0.01] hover:border-cyber-magenta/30 hover:bg-white/[0.03] p-5 transition-all duration-150"
                  >
                    <div className="hidden sm:block relative w-20 h-20 flex-shrink-0 overflow-hidden border border-white/10">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {article.topicTags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 border border-white/10 px-1.5 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="font-mono text-[9px] text-white/25">
                          {formatDate(article.timestamp)}
                        </span>
                      </div>
                      <h3 className="font-headline font-bold text-sm uppercase tracking-wider text-white/80 group-hover:text-cyber-magenta transition-colors truncate mb-1">
                        {article.title}
                      </h3>
                      <p className="text-white/40 text-xs line-clamp-1">
                        {article.description}
                      </p>
                    </div>
                    <span className="hidden sm:block text-white/20 group-hover:text-cyber-magenta transition-colors text-lg flex-shrink-0 mt-1">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="border-t border-white/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber-magenta/60 mb-4">
              OPEN_CHANNEL
            </div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-4">
              Never miss a <span className="text-cyber-magenta">dispatch</span>.
            </h2>
            <p className="text-white/50 text-base mb-8 max-w-md mx-auto">
              Subscribe on Substack for AI insights, investigations, and dispatches from the outer edge.
            </p>
            <a
              href="https://spacepiratezero.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyber-magenta text-black font-headline font-bold text-sm uppercase tracking-widest hover:bg-cyber-magenta/80 transition-colors"
            >
              SUBSCRIBE TO DISPATCHES ↗
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
