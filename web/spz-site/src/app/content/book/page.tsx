import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllContent } from '@/lib/content-loader';
import { BookContent } from '@/types/content';

const BASE_URL = 'https://www.spacepiratezero.com';
const OG_IMAGE = `${BASE_URL}/api/og?title=Books&subtitle=Space+Pirate+Zero+Publications&type=book`;

export const metadata: Metadata = {
  title: 'Books // Space Pirate Zero',
  description:
    'Books and publications by Greg Chambers (Space Pirate Zero). Graphic novels, enterprise strategy guides, and dispatches from the outer edge.',
  alternates: { canonical: `${BASE_URL}/content/book` },
  openGraph: {
    title: 'Books // Space Pirate Zero',
    description: 'Books and publications by Space Pirate Zero.',
    url: `${BASE_URL}/content/book`,
    siteName: 'Space Pirate Zero',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Space Pirate Zero Books' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Books // Space Pirate Zero',
    description: 'Books and publications by Space Pirate Zero.',
    images: [OG_IMAGE],
  },
};

export default async function BookArchivePage() {
  const allContent = await getAllContent();
  const books = (allContent.filter((item) => item.type === 'Book') as BookContent[]).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <main className="pt-16">
      {/* ── HERO ── */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,128,0.05),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyber-magenta/60 mb-4">
            PUBLICATIONS // FULL_ARCHIVE
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl lg:text-7xl uppercase tracking-tight text-white leading-[0.9] mb-6">
            Books &amp;
            <br />
            <span className="text-cyber-magenta">Publications.</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl">
            {books.length} publication{books.length !== 1 ? 's' : ''} from Space Pirate Zero.
            Graphic novels, strategy guides, and long-form dispatches from the outer edge.
          </p>
        </div>
      </section>

      {/* ── BOOK LIST ── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {books.length === 0 ? (
            <p className="text-white/40 font-mono text-sm">No publications archived yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/content/book/${book.slug}`}
                  className="group border border-white/10 bg-white/[0.02] hover:border-cyber-magenta/50 hover:bg-white/[0.04] transition-all duration-150 flex flex-col"
                >
                  <div className="relative w-full aspect-[3/2] overflow-hidden border-b border-white/10">
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {book.status && (
                      <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-[0.2em] bg-cyber-magenta/90 text-black px-2 py-1">
                        {book.status}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.topicTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyber-magenta/60 border border-cyber-magenta/20 px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h2 className="font-headline font-bold text-lg uppercase tracking-wider text-white group-hover:text-cyber-magenta transition-colors mb-2">
                      {book.title}
                    </h2>
                    <p className="text-white/50 text-sm line-clamp-3 mb-4 flex-1">
                      {book.description}
                    </p>
                    <div className="font-mono text-[10px] text-white/30">
                      {book.author || 'Greg Chambers'}
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
