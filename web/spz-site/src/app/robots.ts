import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Googlebot-Image", "Bingbot", "DuckDuckBot", "Slurp"],
        allow: "/",
      },
      {
        userAgent: ["Twitterbot", "LinkedInBot", "facebookexternalhit"],
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "anthropic-ai",
          "Claude-Web",
          "PerplexityBot",
          "CCBot",
          "Omgilibot",
          "DataForSeoBot",
          "PetalBot",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://www.spacepiratezero.com/sitemap.xml",
  };
}
