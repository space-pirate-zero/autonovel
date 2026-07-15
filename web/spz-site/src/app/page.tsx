import type { Metadata } from "next";
import { getAllContent } from "@/lib/content-loader";
import { getLiveDispatches } from "@/lib/substack-live";
import { SPZHomePage } from "@/components/SPZHomePage";

export const metadata: Metadata = {
  title: "Digital Insurgent at Large",
  description:
    "Greg Chambers (Space Pirate Zero) — investigative AI writer, multi-patent inventor, enterprise strategist, music producer, and captain of Spaceship Alpha 9.",
  alternates: {
    canonical: "https://www.spacepiratezero.com",
  },
};

const homeFaqs = [
  {
    q: "Who is Space Pirate Zero?",
    a: "Greg Chambers — enterprise AI strategist turned indie builder. Former Coca-Cola Director of Innovation. Guinness World Record holder. Multi-patent inventor. Now building 6 AI-native products from a home office in Atlanta.",
  },
  {
    q: "What is Spaceship Alpha 9?",
    a: "An AI-native indie software studio building 6 products across consumer apps, developer tools, games, and infrastructure. Zero venture capital. Two people. All signal, no noise.",
  },
  {
    q: "What kind of content does Space Pirate Zero write?",
    a: "Investigative AI dispatches on Substack — enterprise AI failures, dark web investigations, cybersecurity analysis, and what real digital transformation looks like versus what it gets sold as.",
  },
  {
    q: "What music does Space Pirate Zero make?",
    a: "Cosmic lo-fi hip-hop, ambient electronic, and experimental beats. Six albums on all streaming platforms. The kind of music that sounds like what would happen if Bossa Nova and a satellite collision had a baby.",
  },
  {
    q: "Why is the website so... intense?",
    a: "The cel-shading is intentional. The chunky borders are load-bearing. The neon pink is a design decision, not a cry for help. Software has looked like PowerPoint for too long.",
  },
  {
    q: "Can I hire Space Pirate Zero?",
    a: "Greg Chambers is available for enterprise AI strategy consulting, keynote speaking, and investigative writing commissions. Contact via the channels on the bio page.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default async function Home() {
  const [allContent, liveDispatches] = await Promise.all([
    getAllContent(),
    getLiveDispatches(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <SPZHomePage content={allContent} liveDispatches={liveDispatches} />
    </>
  );
}
