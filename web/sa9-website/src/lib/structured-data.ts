import type { Product } from "./products";
import type { MusicAlbum } from "./music";

const BASE_URL = "https://spaceshipalpha9.co";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spaceship Alpha 9",
    alternateName: "SA9",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "AI-native indie software studio building 6 products with zero venture capital. Consumer apps, developer tools, AI platforms, games, and infrastructure.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Greg Chambers",
      alternateName: "Space Pirate Zero",
      url: "https://spacepiratezero.com",
      jobTitle: "Founder & Captain",
      sameAs: [
        "https://linkedin.com/in/gregchambers/",
        "https://x.com/SpacePirateZero",
        "https://bsky.app/profile/spacepiratezero.bsky.social",
        "https://spacepiratezero.substack.com",
      ],
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Atlanta",
      addressRegion: "GA",
      addressCountry: "US",
    },
    sameAs: [
      "https://github.com/space-pirate-zero",
      "https://x.com/SpacePirateZero",
      "https://linkedin.com/company/spaceship-alpha-9",
      "https://bsky.app/profile/spacepiratezero.bsky.social",
    ],
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: 2,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Spaceship Alpha 9",
    alternateName: "SA9",
    url: BASE_URL,
    description:
      "AI-native indie studio. 6 products. Zero venture capital. Intelligence embedded, not decorated.",
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
    },
  };
}

export function productJsonLd(product: Product) {
  const statusMap: Record<string, string> = {
    live: "https://schema.org/InStock",
    beta: "https://schema.org/PreOrder",
    development: "https://schema.org/PreOrder",
    docs: "https://schema.org/InStock",
  };

  const categoryMap: Record<string, string> = {
    consumer: "LifestyleApplication",
    developer: "DeveloperApplication",
    infrastructure: "UtilitiesApplication",
    game: "GameApplication",
    entertainment: "EntertainmentApplication",
  };

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.heroDescription,
    url: `${BASE_URL}/products/${product.id}`,
    applicationCategory: categoryMap[product.type] ?? "UtilitiesApplication",
    operatingSystem: product.platforms.join(", "),
    offers: {
      "@type": "Offer",
      availability: statusMap[product.status] ?? "https://schema.org/PreOrder",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: BASE_URL,
    },
    featureList: product.features.map((f) => f.title).join(", "),
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  description: string;
  image?: string;
  date: string;
  author?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}/dispatches/${article.slug}`,
    datePublished: article.date,
    dateModified: article.date,
    image: article.image
      ? [article.image]
      : [`${BASE_URL}/og-image.jpg`],
    keywords: article.keywords?.join(", ") ?? "",
    author: {
      "@type": "Person",
      name: article.author ?? "Greg Chambers",
      alternateName: "Space Pirate Zero",
      url: "https://spacepiratezero.com",
      sameAs: [
        "https://spacepiratezero.substack.com",
        "https://x.com/SpacePirateZero",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/dispatches/${article.slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      name: "Dispatches from Space Pirate Zero",
      url: `${BASE_URL}/dispatches`,
    },
  };
}

export function musicAlbumJsonLd(album: MusicAlbum) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    description: album.description,
    url: `${BASE_URL}/music/${album.slug}`,
    datePublished: album.date,
    image: album.image,
    genre: album.tags,
    numTracks: album.tracks.length,
    track: album.tracks.map((t, i) => ({
      "@type": "MusicRecording",
      position: i + 1,
      name: t.title,
      duration: `PT${t.duration.replace(":", "M")}S`,
    })),
    byArtist: {
      "@type": "MusicGroup",
      name: "Space Pirate Zero",
      url: "https://spacepiratezero.com",
      sameAs: [
        "https://open.spotify.com/artist/5hsu0KPjwVKMCx1hAMFvI4",
        "https://music.apple.com/us/artist/space-pirate-zero/1751347344",
      ],
    },
    offers: [
      { "@type": "Offer", url: album.spotify, name: "Spotify" },
      { "@type": "Offer", url: album.appleMusic, name: "Apple Music" },
    ],
  };
}


export function faqPageJsonLd(
  faqs: Array<{ q: string; a: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function personJsonLd(person: {
  name: string;
  alternateName?: string;
  jobTitle: string;
  description: string;
  url: string;
  image?: string;
  sameAs?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    ...(person.alternateName && { alternateName: person.alternateName }),
    jobTitle: person.jobTitle,
    description: person.description,
    url: person.url,
    ...(person.image && { image: person.image }),
    ...(person.sameAs && { sameAs: person.sameAs }),
    worksFor: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: BASE_URL,
    },
  };
}

export function videoObjectJsonLd(video: {
  title: string;
  description: string;
  youtubeId: string;
  date: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`,
    uploadDate: video.date,
    contentUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
    embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
    ...(video.duration && { duration: video.duration }),
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: BASE_URL,
    },
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
