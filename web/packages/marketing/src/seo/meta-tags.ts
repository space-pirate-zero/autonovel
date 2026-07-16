/**
 * Universal meta tag generator for all SA9 marketing sites.
 * Produces complete Next.js Metadata objects with OpenGraph, Twitter cards,
 * robots directives, and canonical URLs.
 */

import type { Metadata } from "next";

export interface SiteAuthor {
  name: string;
  url?: string;
}

export interface SiteMetaConfig {
  siteName: string;
  siteUrl: string;
  title: string;
  description: string;
  ogImage?: string;
  /** Override the OpenGraph card title (defaults to `title`). */
  ogTitle?: string;
  /** Override the OpenGraph card description (defaults to `description`). */
  ogDescription?: string;
  /** Override the Twitter card title (defaults to `title`). */
  twitterTitle?: string;
  /** Override the Twitter card description (defaults to `description`). */
  twitterDescription?: string;
  twitterHandle?: string;
  locale?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
  /** Google category taxonomy (e.g. "technology"). */
  category?: string;
  /** Path to PWA manifest (relative to site root). */
  manifest?: string;
  /** Author list — defaults to Space Pirate Zero. */
  authors?: SiteAuthor[];
  /** Creator override — defaults to "Spaceship Alpha 9". */
  creator?: string;
  /** Publisher override — defaults to "Spaceship Alpha 9". */
  publisher?: string;
}

/**
 * Generate a complete Next.js Metadata object from a site config.
 * Covers metadataBase, openGraph, twitter card, robots, alternates, and icons.
 */
export function generateSiteMetadata(config: SiteMetaConfig): Metadata {
  const {
    siteName,
    siteUrl,
    title,
    description,
    ogImage,
    ogTitle,
    ogDescription,
    twitterTitle,
    twitterDescription,
    twitterHandle = "@SpacePirateZero",
    locale = "en_US",
    keywords,
    canonicalUrl,
    noIndex = false,
    category,
    manifest,
    authors = [{ name: "Space Pirate Zero", url: "https://spacepiratezero.com" }],
    creator = "Spaceship Alpha 9",
    publisher = "Spaceship Alpha 9",
  } = config;

  const resolvedOgImage = ogImage ?? `${siteUrl}/og-image.jpg`;
  const resolvedCanonical = canonicalUrl ?? siteUrl;
  const resolvedOgTitle = ogTitle ?? title;
  const resolvedOgDescription = ogDescription ?? description;
  const resolvedTwitterTitle = twitterTitle ?? title;
  const resolvedTwitterDescription = twitterDescription ?? description;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    ...(keywords && { keywords }),
    authors,
    creator,
    publisher,
    ...(category && { category }),
    ...(manifest && { manifest }),
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large" as const,
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale,
      url: resolvedCanonical,
      siteName,
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: resolvedOgTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: twitterHandle,
      creator: twitterHandle,
      title: resolvedTwitterTitle,
      description: resolvedTwitterDescription,
      images: [resolvedOgImage],
    },
    alternates: {
      canonical: resolvedCanonical,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
  };
}

/* ─── Product Presets ─────────────────────────────────────────────────── */

/** Space Pirate Zero personal site */
export const SPZ_META = generateSiteMetadata({
  siteName: "Space Pirate Zero",
  siteUrl: "https://www.spacepiratezero.com",
  title: "Space Pirate Zero | Digital Insurgent at Large",
  description:
    "Greg Chambers (Space Pirate Zero) — investigative AI writer, enterprise strategist, multi-patent inventor, music producer, and captain of Spaceship Alpha 9. No algorithms. No noise.",
  ogDescription:
    "Investigative AI writer, enterprise strategist, and captain of Spaceship Alpha 9. No algorithms. No noise.",
  twitterDescription:
    "Investigative AI writer, enterprise strategist, and captain of Spaceship Alpha 9.",
  ogImage:
    "https://www.spacepiratezero.com/api/og?title=Space+Pirate+Zero&subtitle=Digital+Insurgent+at+Large",
  keywords: [
    "Greg Chambers",
    "Space Pirate Zero",
    "Spaceship Alpha 9",
    "AI strategy",
    "artificial intelligence",
    "enterprise innovation",
    "digital insurgency",
    "investigative AI writing",
    "Substack writer",
    "music producer",
    "Coca-Cola innovation",
  ],
  authors: [
    { name: "Greg Chambers", url: "https://spaceshipalpha9.co" },
    { name: "Space Pirate Zero", url: "https://www.spacepiratezero.com" },
  ],
  creator: "Greg Chambers",
  publisher: "Spaceship Alpha 9",
  manifest: "/manifest.webmanifest",
});

/** SA9 main website */
export const SA9_META = generateSiteMetadata({
  siteName: "Spaceship Alpha 9",
  siteUrl: "https://spaceshipalpha9.co",
  title: "Spaceship Alpha 9 — AI-Native Indie Studio | 6 Products, Zero VC",
  description:
    "AI-native indie studio shipping 6 products across consumer apps, dev tools, and infrastructure. Founded by Space Pirate Zero. Zero VC.",
  ogDescription:
    "Bootstrapped AI studio from the mind of Space Pirate Zero. 6 products shipping. Consumer apps, dev tools, AI platforms, games. Intelligence embedded in every one.",
  twitterTitle: "Spaceship Alpha 9 — AI That Doesn't Suck",
  twitterDescription:
    "6 AI-native products. Zero VC. One indie studio. Intelligence embedded, not decorated.",
  keywords: [
    "AI software studio",
    "indie developer",
    "bootstrapped startup",
    "AI-native products",
    "Space Pirate Zero",
    "Spaceship Alpha 9",
    "developer tools",
    "AI applications",
    "independent software",
    "no venture capital",
  ],
  category: "technology",
  manifest: "/manifest.webmanifest",
});

/** StyleLift marketing site */
export const STYLELIFT_META = generateSiteMetadata({
  siteName: "StyleLift",
  siteUrl: "https://stylelift.fashion",
  title:
    "StyleLift — AI Wardrobe App | Smart Closet, Style DNA & Outfit Planning",
  description:
    "StyleLift is the AI-powered wardrobe app that digitizes your closet, decodes your style DNA, and delivers daily outfit suggestions. Shop smarter with fit predictions, budget tracking, and Style Circles.",
  ogImage: "https://stylelift.fashion/og-image.png",
  twitterHandle: "@styleliftapp",
  keywords: [
    "AI stylist",
    "wardrobe app",
    "smart closet",
    "style DNA",
    "outfit planner",
    "fashion AI",
    "StyleLift",
    "style intelligence",
    "fit prediction",
    "Style Circles",
  ],
  category: "lifestyle",
});

/** DARKWAVE marketing site */
export const DARKWAVE_META = generateSiteMetadata({
  siteName: "DARKWAVE",
  siteUrl: "https://darkwave.spaceshipalpha9.co",
  title: "DARKWAVE — Autonomous Kubernetes Command System",
  description:
    "Autonomous Kubernetes orchestration. DARKWAVE watches clusters, heals failures, and enforces policy automatically. Built by Spaceship Alpha 9.",
  ogDescription:
    "Autonomous Kubernetes orchestration. Watches clusters, heals failures, enforces policy. Built by Spaceship Alpha 9.",
  twitterTitle: "DARKWAVE — Kubernetes That Never Sleeps",
  twitterDescription:
    "Autonomous Kubernetes orchestration. Self-healing. Policy enforcement. Built by Spaceship Alpha 9.",
  ogImage:
    "https://spaceshipalpha9.co/api/og?title=DARKWAVE&subtitle=Autonomous+Kubernetes+Command+System&type=product",
  keywords: [
    "Kubernetes",
    "autonomous operations",
    "self-healing",
    "cluster management",
    "DevOps",
    "SRE",
    "platform engineering",
    "DARKWAVE",
    "Spaceship Alpha 9",
  ],
  category: "technology",
});

/** GhostDeck marketing site */
export const GHOSTDECK_META = generateSiteMetadata({
  siteName: "GhostDeck",
  siteUrl: "https://ghostdeck.spaceshipalpha9.co",
  title: "GhostDeck — Native macOS VM Orchestration | Apple Silicon",
  description:
    "Create, manage, and fleet Apple Silicon virtual machines from the menu bar. 89 MCP tools for AI agent integration. Native macOS. Zero overhead. Invisible power.",
  ogTitle: "GhostDeck — Native macOS VM Orchestration",
  ogDescription:
    "Create, manage, and fleet Apple Silicon VMs from the menu bar. 89 MCP tools. Native macOS performance. Built by Space Pirate Zero.",
  twitterTitle: "GhostDeck — VMs That Disappear Into Your Workflow",
  twitterDescription:
    "Native macOS VM orchestration. 89 MCP tools. Apple Silicon native. Menu bar app. Fleet management via Bonjour mesh.",
  keywords: [
    "macOS virtual machine",
    "VM orchestration",
    "Apple Silicon VM",
    "macOS Virtualization",
    "developer tools",
    "MCP tools",
    "AI agent",
    "fleet management",
    "GhostDeck",
    "Spaceship Alpha 9",
  ],
  category: "technology",
  manifest: "/manifest.webmanifest",
});

/** TradeCraft marketing site */
export const TRADECRAFT_META = generateSiteMetadata({
  siteName: "TradeCraft",
  siteUrl: "https://tradecraft.spaceshipalpha9.co",
  title: "TradeCraft — Counter-Surveillance Digital Toolkit",
  description:
    "Defensive digital toolkit for activists, journalists & protesters. Zero-knowledge. Offline-first. No accounts. No telemetry. Panic-wipe capable. 12 epics, 85+ tools.",
  ogTitle: "TradeCraft — They Watch Everything. Now You Watch Back.",
  ogDescription:
    "Counter-surveillance digital toolkit for activists, journalists & protesters. 12 epics. 85+ tools. Zero-knowledge. Offline-first. Panic-wipe capable.",
  twitterTitle: "TradeCraft — They Watch Everything. Now You Watch Back.",
  twitterDescription:
    "Counter-surveillance digital toolkit. 12 epics. 85+ tools. Zero-knowledge. Offline-first.",
  keywords: [
    "counter-surveillance",
    "privacy toolkit",
    "activist tools",
    "journalist security",
    "IMSI catcher detection",
    "Stingray detector",
    "BLE mesh",
    "encrypted communication",
    "offline-first",
    "panic wipe",
    "TradeCraft",
    "Spaceship Alpha 9",
  ],
  category: "technology",
  manifest: "/manifest.webmanifest",
});

/** Grocery Ninja marketing site */
export const GROCERY_NINJA_META = generateSiteMetadata({
  siteName: "Grocery Ninja",
  siteUrl: "https://groceryninja.spaceshipalpha9.co",
  title: "Grocery Ninja — AI Grocery & Meal Planning",
  description:
    "AI-powered grocery lists and meal planning that learns your habits, finds deals, and eliminates food waste.",
  keywords: [
    "grocery app",
    "meal planning",
    "AI grocery",
    "Grocery Ninja",
    "food waste",
    "shopping list",
  ],
});

/** Phantom Tiles marketing site */
export const PHANTOM_TILES_META = generateSiteMetadata({
  siteName: "Phantom Tiles",
  siteUrl: "https://phantomtiles.spaceshipalpha9.co",
  title: "Phantom Tiles — Arcade Rummikub Game",
  description:
    "Fast-paced arcade Rummikub with Metal 3 graphics, GameKit multiplayer, and the NEON design system.",
  keywords: [
    "Rummikub",
    "arcade game",
    "Phantom Tiles",
    "iOS game",
    "Metal 3",
    "multiplayer",
  ],
});

/** REWIND TV marketing site */
export const REWIND_TV_META = generateSiteMetadata({
  siteName: "REWIND TV",
  siteUrl: "https://rewindtv.spaceshipalpha9.co",
  title: "REWIND TV — Retro Streaming TV Guide",
  description:
    "A retro-styled streaming TV guide with CRT shaders, curated channels, and nostalgia-driven discovery for Apple TV.",
  keywords: [
    "TV guide",
    "retro streaming",
    "REWIND TV",
    "Apple TV",
    "CRT shader",
    "nostalgia",
  ],
});

/** Country Plus marketing site */
export const COUNTRYPLUS_META = generateSiteMetadata({
  siteName: "Country Plus",
  siteUrl: "https://countryplus.spaceshipalpha9.co",
  title: "Country Plus — The Sovereign Digital Stage",
  description:
    "The first streaming platform built for country music. 80–90% revenue to artists. AI-filtered. Fan-first.",
  keywords: [
    "country music",
    "streaming platform",
    "Country Plus",
    "artist revenue",
    "music streaming",
    "independent artists",
  ],
});
