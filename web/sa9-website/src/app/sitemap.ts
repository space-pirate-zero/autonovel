import type { MetadataRoute } from "next";
import { staticPages } from "@sa9/marketing/seo";
import { products } from "@/lib/products";
import { dispatches } from "@/lib/dispatches";
import { albums } from "@/lib/music";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://spaceshipalpha9.co";
  const BUILD_DATE = "2026-03-23";

  const pages = staticPages(
    baseUrl,
    [
      { path: "/", priority: 1.0, freq: "weekly" },
      { path: "/products", priority: 0.9, freq: "weekly" },
      { path: "/studio", priority: 0.85, freq: "weekly" },
      { path: "/consulting", priority: 0.85, freq: "monthly" },
      { path: "/about", priority: 0.7, freq: "monthly" },
      { path: "/manifesto", priority: 0.6, freq: "monthly" },
      { path: "/dispatches", priority: 0.8, freq: "weekly" },
      { path: "/music", priority: 0.7, freq: "monthly" },
      { path: "/press", priority: 0.7, freq: "monthly" },
      { path: "/contact", priority: 0.5, freq: "yearly" },
      { path: "/faq", priority: 0.6, freq: "monthly" },
      { path: "/privacy", priority: 0.3, freq: "yearly" },
      { path: "/terms", priority: 0.3, freq: "yearly" },
    ],
    BUILD_DATE,
  );

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Commercial subdomain landing pages
  const commercialPages: MetadataRoute.Sitemap = products
    .filter((p) => p.subdomain && p.id !== "spz" && p.id !== "tradecraft")
    .map((product) => ({
      url: `${baseUrl}/sites/${product.id}`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  const dispatchPages: MetadataRoute.Sitemap = dispatches.map((dispatch) => ({
    url: `${baseUrl}/dispatches/${dispatch.slug}`,
    lastModified: new Date(dispatch.date),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const musicPages: MetadataRoute.Sitemap = albums.map((album) => ({
    url: `${baseUrl}/music/${album.slug}`,
    lastModified: new Date(album.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...pages,
    ...productPages,
    ...commercialPages,
    ...dispatchPages,
    ...musicPages,
  ];
}
