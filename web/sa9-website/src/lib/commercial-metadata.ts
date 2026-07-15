import type { Metadata } from "next";
import type { Product } from "./products";

/** Truncate text to maxLen at a word boundary, appending ellipsis if needed. */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > maxLen * 0.6 ? truncated.slice(0, lastSpace) : truncated) + "...";
}

const CATEGORY_MAP: Record<string, string> = {
  flagship: "BusinessApplication",
  platform: "BusinessApplication",
  saas: "BusinessApplication",
  consumer: "LifestyleApplication",
  tool: "DeveloperApplication",
  game: "GameApplication",
  infra: "DeveloperApplication",
  entertainment: "EntertainmentApplication",
};

export function generateCommercialMetadata(product: Product): Metadata {
  const subdomain = product.subdomain;
  const baseUrl = `https://${subdomain}.spaceshipalpha9.co`;
  const title = `${product.name} — ${product.tagline}`;
  const description = truncateAtWord(product.heroDescription, 155);
  const ogImageUrl = `https://spaceshipalpha9.co/api/og?title=${encodeURIComponent(product.name)}&subtitle=${encodeURIComponent(product.tagline)}&type=product`;

  return {
    title: {
      default: title,
      template: `%s | ${product.name}`,
    },
    description,
    keywords: [
      product.name,
      ...product.stack,
      ...product.platforms,
      "Spaceship Alpha 9",
      "Space Pirate Zero",
      "AI-native",
    ],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: "/",
    },
    authors: [{ name: "Spaceship Alpha 9", url: "https://spaceshipalpha9.co" }],
    creator: "Spaceship Alpha 9",
    publisher: "Spaceship Alpha 9",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: product.name,
      title: `${product.name} | ${product.tagline}`,
      description: truncateAtWord(product.heroDescription, 200),
      url: baseUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} — ${product.tagline}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      creator: "@SpacePirateZero",
      site: "@SpacePirateZero",
      title: `${product.name} — ${product.tagline}`,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      apple: "/apple-touch-icon.png",
    },
    category: "technology",
  };
}

export function commercialProductJsonLd(product: Product) {
  const baseUrl = `https://${product.subdomain}.spaceshipalpha9.co`;

  const statusMap: Record<string, string> = {
    live: "https://schema.org/InStock",
    beta: "https://schema.org/PreOrder",
    development: "https://schema.org/PreOrder",
    docs: "https://schema.org/InStock",
  };

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.heroDescription,
    url: baseUrl,
    applicationCategory: CATEGORY_MAP[product.type] ?? "UtilitiesApplication",
    operatingSystem: product.platforms.join(", "),
    image: `https://spaceshipalpha9.co/api/og?title=${encodeURIComponent(product.name)}&subtitle=${encodeURIComponent(product.tagline)}&type=product`,
    offers: {
      "@type": "Offer",
      availability:
        statusMap[product.status] ?? "https://schema.org/PreOrder",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Spaceship Alpha 9",
      url: "https://spaceshipalpha9.co",
    },
    featureList: product.features.map((f) => f.title).join(", "),
    isPartOf: {
      "@type": "WebSite",
      name: "Spaceship Alpha 9",
      url: "https://spaceshipalpha9.co",
    },
  };
}
