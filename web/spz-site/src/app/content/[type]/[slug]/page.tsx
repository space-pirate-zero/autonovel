import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BaseContent, ArticleContent, BookContent } from '@/types/content';
import { ContentDisplay } from '@/components/content/ContentDisplay';
import { SynchronizedSignals } from '@/components/content/SynchronizedSignals';
import { getAllContent } from '@/lib/content-loader';

const BASE_URL = 'https://www.spacepiratezero.com';

type Props = {
  params: Promise<{ type: string; slug: string }>;
};

async function resolveContent(type: string, slug: string): Promise<BaseContent | null> {
  const allContent = await getAllContent();
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

  return allContent.find(item =>
    item.slug && item.slug.toLowerCase() === decodedSlug
  ) || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const content = await resolveContent(type, slug);

  if (!content) {
    return {
      title: '404 - Transmission Lost',
      description: 'The requested archival node could not be found.',
    };
  }

  const article = content as ArticleContent;
  const description = (article.summary || content.description || '').substring(0, 160);
  const keywords = article.seo_keywords?.length ? article.seo_keywords : content.topicTags;
  const canonicalUrl = `${BASE_URL}/content/${content.type.toLowerCase()}/${content.slug}`;
  const author = article.author || 'Greg Chambers';

  // Use cover image if available, otherwise generate dynamic OG
  const ogImage = content.coverImage && !content.coverImage.includes('placeholder')
    ? content.coverImage
    : `${BASE_URL}/api/og?title=${encodeURIComponent(content.title)}&type=${encodeURIComponent(content.type.toLowerCase())}`;

  return {
    title: content.title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: content.title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'Space Pirate Zero',
      images: [{ url: ogImage, alt: content.title }],
      publishedTime: content.timestamp,
      authors: [author],
      tags: content.topicTags,
      section: content.topicTags?.[0],
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description,
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  const allContent = await getAllContent();
  return allContent.map((item) => ({
    type: item.type.toLowerCase(),
    slug: item.slug,
  }));
}

function buildJsonLd(content: BaseContent): Record<string, unknown> | null {
  const url = `${BASE_URL}/content/${content.type.toLowerCase()}/${content.slug}`;
  const article = content as ArticleContent;
  const book = content as BookContent;
  const author = {
    '@type': 'Person',
    '@id': `${BASE_URL}/#greg-chambers`,
    name: article.author || 'Greg Chambers',
    alternateName: 'Space Pirate Zero',
    url: BASE_URL,
    sameAs: ['https://spaceshipalpha9.co', 'https://spacepiratezero.substack.com'],
  };
  const publisher = {
    '@type': 'Organization',
    '@id': 'https://spaceshipalpha9.co/#organization',
    name: 'SpaceShip Alpha 9 LLC',
    alternateName: 'Space Pirate Zero',
    url: 'https://spaceshipalpha9.co',
    sameAs: [BASE_URL, 'https://stylelift.fashion'],
  };

  if (content.type === 'Article') {
    const isVideo = content.subtype?.includes('video');

    if (isVideo && article.youtube_id) {
      return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: content.title,
        description: (article.summary || content.description).substring(0, 300),
        thumbnailUrl: content.coverImage,
        embedUrl: `https://www.youtube.com/embed/${article.youtube_id}`,
        uploadDate: content.timestamp,
        author,
        publisher,
        url,
      };
    }

    const isPress = content.subtype === 'press' || content.subtype === 'video press' || content.subtype === 'video_press';
    const schemaType = content.subtype === 'patent' ? 'CreativeWork' : isPress ? 'NewsArticle' : 'Article';

    return {
      '@context': 'https://schema.org',
      '@type': schemaType,
      headline: content.title,
      description: (article.summary || content.description).substring(0, 300),
      image: content.coverImage,
      datePublished: content.timestamp,
      author,
      publisher,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      ...(article.seo_keywords?.length && { keywords: article.seo_keywords.join(', ') }),
      ...(content.topicTags?.[0] && { articleSection: content.topicTags[0] }),
      ...(isPress && { isPartOf: { '@type': 'Periodical', name: 'Space Pirate Zero Press Archive' } }),
    };
  }

  if (content.type === 'Book') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: content.title,
      description: content.description,
      image: content.coverImage,
      author: { '@type': 'Person', name: 'Greg Chambers', url: BASE_URL },
      url,
      ...(book.amazonLink && { offers: { '@type': 'Offer', url: book.amazonLink } }),
    };
  }

  return null;
}

export default async function ContentPage({ params }: Props) {
  const { type, slug } = await params;
  const content = await resolveContent(type, slug);
  const allContent = await getAllContent();

  if (!content) {
    notFound();
  }

  const jsonLd = buildJsonLd(content);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: content.type, item: `${BASE_URL}/content/${content.type.toLowerCase()}` },
      { '@type': 'ListItem', position: 3, name: content.title, item: `${BASE_URL}/content/${content.type.toLowerCase()}/${content.slug}` },
    ],
  };
  return (
    <div className="relative min-h-screen bg-sa9-surface flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="flex-grow pb-20 px-4 md:px-10 max-w-7xl mx-auto w-full relative z-10">
        <ContentDisplay content={content} />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <SynchronizedSignals />
      </div>
    </div>
  );
}
