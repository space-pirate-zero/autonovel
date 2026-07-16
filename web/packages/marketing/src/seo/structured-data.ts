/**
 * Shared structured data (JSON-LD) generators for all SA9 marketing sites.
 * Extracted from website/src/lib/structured-data.ts and parameterized with baseUrl.
 */

const SA9_BASE_URL = "https://spaceshipalpha9.co";

export function organizationJsonLd(baseUrl = SA9_BASE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Spaceship Alpha 9",
    alternateName: "SA9",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "AI-native indie software studio building 6 products with zero venture capital.",
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
  };
}

export function websiteJsonLd(opts: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: opts.name,
    url: opts.url,
    description: opts.description,
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
    },
  };
}

export interface SoftwareAppOffer {
  price: string;
  priceCurrency?: string;
  availability?: "live" | "beta" | "development" | "waitlist";
  description?: string;
}

export function softwareAppJsonLd(app: {
  name: string;
  description: string;
  url: string;
  id?: string;
  category?: string;
  platforms?: string[];
  status?: "live" | "beta" | "development" | "waitlist";
  image?: string;
  offers?: SoftwareAppOffer[];
}) {
  const availabilityMap: Record<string, string> = {
    live: "https://schema.org/InStock",
    beta: "https://schema.org/PreOrder",
    development: "https://schema.org/PreOrder",
    waitlist: "https://schema.org/PreOrder",
  };

  const offersPayload =
    app.offers && app.offers.length > 0
      ? app.offers.map((offer) => ({
          "@type": "Offer" as const,
          price: offer.price,
          priceCurrency: offer.priceCurrency ?? "USD",
          availability:
            availabilityMap[offer.availability ?? app.status ?? "development"],
          ...(offer.description && { description: offer.description }),
        }))
      : {
          "@type": "Offer" as const,
          availability: availabilityMap[app.status ?? "development"],
          price: "0",
          priceCurrency: "USD",
        };

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    ...(app.id && { "@id": app.id }),
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: app.category ?? "UtilitiesApplication",
    ...(app.platforms && { operatingSystem: app.platforms.join(", ") }),
    ...(app.image && { image: app.image }),
    offers: offersPayload,
    creator: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: SA9_BASE_URL,
    },
  };
}

export function articleJsonLd(article: {
  title: string;
  slug: string;
  description: string;
  baseUrl: string;
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
    url: `${article.baseUrl}/dispatches/${article.slug}`,
    datePublished: article.date,
    dateModified: article.date,
    image: article.image ? [article.image] : [`${article.baseUrl}/og-image.jpg`],
    keywords: article.keywords?.join(", ") ?? "",
    author: {
      "@type": "Person",
      name: article.author ?? "Greg Chambers",
      alternateName: "Space Pirate Zero",
      url: "https://spacepiratezero.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: SA9_BASE_URL,
      logo: `${SA9_BASE_URL}/logo.png`,
    },
  };
}

export function faqPageJsonLd(faqs: Array<{ q: string; a: string }>) {
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

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
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
      url: SA9_BASE_URL,
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
      url: SA9_BASE_URL,
    },
  };
}
