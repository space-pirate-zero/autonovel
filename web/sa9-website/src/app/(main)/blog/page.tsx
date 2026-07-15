import type { Metadata } from "next";
import { BlogPage } from "@sa9/marketing/blog";

// Must be a literal so Next.js can statically parse the route config.
// Keep in sync with BLOG_REVALIDATE in @sa9/marketing/blog/rss-fetcher.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Dispatches from Space Pirate Zero",
  description:
    "Investigative AI writing, cybersecurity deep-dives, cultural criticism, and gonzo tech journalism from Space Pirate Zero. Read the latest dispatches from the outer edge.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog — Dispatches from Space Pirate Zero",
    description:
      "Investigative AI journalism, dark web exposes, cybersecurity analysis, and cultural criticism. Subscribe on Substack.",
    images: [
      {
        url: "/api/og?title=Blog&subtitle=Dispatches+from+the+Outer+Edge&type=dispatch",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function BlogRoute() {
  return (
    <BlogPage
      siteTitle="Space Pirate Zero"
      designSystem="neon"
      description="Investigative AI writing, cybersecurity deep-dives, cultural criticism, and gonzo tech journalism. Subscribe on Substack for the full experience."
    />
  );
}
