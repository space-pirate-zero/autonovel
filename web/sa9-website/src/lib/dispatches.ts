/**
 * Dispatches — Space Pirate Zero Substack articles.
 *
 * Live data is fetched from Substack via `make content-fetch` and written to
 * website/src/data/dispatches-live.json.  This module re-exports that JSON
 * when it has content, otherwise falls back to the curated static list below.
 *
 * Fields added for full-article support:
 *   slug        — URL-safe identifier used for /dispatches/[slug] routes
 *   htmlContent — Full article HTML (populated by fetch script)
 *   readingTime — Estimated read time in minutes
 *   author      — Byline (default: Greg Chambers)
 *   images      — All image URLs found in the article
 *   rss_guid    — Substack GUID for deduplication
 */

import liveData from "@/data/dispatches-live.json";

export interface Dispatch {
  id: number;
  title: string;
  slug: string;
  url: string;
  date: string; // ISO date string YYYY-MM-DD
  image: string;
  description: string;
  summary: string;
  htmlContent?: string;
  tags: string[];
  seoKeywords: string[];
  readingTime?: number;
  author?: string;
  images?: string[];
  rss_guid?: string;
}

// ─── Static fallback (curated, with SEO keywords) ───────────────────────────
// Used when dispatches-live.json is empty (before first `make content-fetch`).

const staticDispatches: Dispatch[] = [
  {
    id: 1,
    title: "In the Shadows: How AI is Infiltrating the Dark Web",
    slug: "in-the-shadows-how-ai-is-infiltrating",
    url: "https://spacepiratezero.substack.com/p/in-the-shadows-how-ai-is-infiltrating",
    date: "2025-04-02",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/3dd50ca1-b7fa-42e6-b5dc-ec6afe1527a7_1536x1536.jpeg",
    description:
      "The first in an investigative series on AI and the dark web, exploring how artificial intelligence is being weaponized to automate fraud.",
    summary:
      "An investigative deep-dive into how AI tools are being co-opted by criminal networks on the dark web, automating fraud at unprecedented scale.",
    tags: ["AI", "Dark Web", "Cybersecurity", "Investigation"],
    seoKeywords: [
      "AI dark web",
      "artificial intelligence fraud",
      "cybercrime automation",
      "FraudGPT",
    ],
  },
  {
    id: 2,
    title: "Why Apple Silicon is Quietly Winning",
    slug: "why-apple-silicon-is-quietly-winning",
    url: "https://spacepiratezero.substack.com/p/why-apple-silicon-is-quietly-winning",
    date: "2024-11-20",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/96c9c647-736a-4d6d-9657-3f9e9d6d3d3d_1536x1536.jpeg",
    description:
      "The transition to Apple Silicon wasn't just a hardware upgrade; it was a fundamental shift in architecture.",
    summary:
      "A technical and strategic analysis of why Apple's in-house silicon is quietly reshaping the entire semiconductor industry.",
    tags: ["Apple Silicon", "Hardware", "Tech Analysis"],
    seoKeywords: [
      "Apple Silicon M-series",
      "ARM architecture",
      "semiconductor strategy",
      "Mac performance",
    ],
  },
  {
    id: 3,
    title: "Instacart Sucks",
    slug: "instacart-sucks",
    url: "https://spacepiratezero.substack.com/p/instacart-sucks",
    date: "2025-05-11",
    image: "https://picsum.photos/seed/instacart/800/600",
    description:
      "A Gonzo descent into the overpriced, overmarketed hell of grocery delivery.",
    summary:
      "A Gonzo-style takedown of the gig economy's grocery delivery industrial complex — and what it reveals about corporate enshittification.",
    tags: ["Gig Economy", "Enshittification", "Critique"],
    seoKeywords: [
      "Instacart critique",
      "gig economy",
      "enshittification",
      "grocery delivery",
    ],
  },
  {
    id: 4,
    title: "The Last Human CEO - Part 1: The CEO's Last Stand",
    slug: "the-last-human-ceo-part-1-the-ceos",
    url: "https://spacepiratezero.substack.com/p/the-last-human-ceo-part-1-the-ceos",
    date: "2025-06-15",
    image: "https://picsum.photos/seed/ceo1/800/600",
    description:
      "The first wave of automated leadership and the defensibility of human intuition.",
    summary:
      "Part 1 of 3: How the first wave of AI-automated management is forcing human executives to articulate what only humans can do.",
    tags: ["AI Leadership", "Future of Work", "Executive Strategy"],
    seoKeywords: [
      "AI CEO",
      "automated leadership",
      "future of work",
      "human intuition",
    ],
  },
  {
    id: 5,
    title: "The Last Human CEO - Part 2: The Business of Humanity",
    slug: "the-last-human-ceo-part-2-the-business",
    url: "https://spacepiratezero.substack.com/p/the-last-human-ceo-part-2-the-business",
    date: "2025-06-22",
    image: "https://picsum.photos/seed/ceo2/800/600",
    description:
      "What remains when the logic and logistics of business are fully automated? Empathy and culture.",
    summary:
      "Part 2 of 3: When AI handles the mechanics of business, the irreducible human value becomes empathy, culture, and ethical judgment.",
    tags: ["Empathy", "Organizational Culture", "Human Connection"],
    seoKeywords: [
      "AI leadership empathy",
      "organizational culture",
      "human value AI",
      "future executive",
    ],
  },
  {
    id: 6,
    title: "The Last Human CEO - Part 3: Hyper-Ethical",
    slug: "the-last-human-ceo-part-3-hyper-ethical",
    url: "https://spacepiratezero.substack.com/p/the-last-human-ceo-part-3-hyper-ethical",
    date: "2025-06-29",
    image: "https://picsum.photos/seed/ceo3/800/600",
    description:
      "The executive as the final firewall against the unintended consequences of autonomous corporate entities.",
    summary:
      "Part 3 of 3: Why the last job of the human CEO is being the ethical firewall — the one accountable party in an autonomous corporate machine.",
    tags: ["AI Governance", "Ethics", "Accountability"],
    seoKeywords: [
      "AI governance CEO",
      "corporate ethics",
      "autonomous AI accountability",
      "AI regulation",
    ],
  },
  {
    id: 7,
    title: "AI-Driven Cyberattack Simulation",
    slug: "ai-driven-cyberattack-simulation",
    url: "https://spacepiratezero.substack.com/p/ai-driven-cyberattack-simulation",
    date: "2025-07-12",
    image: "https://picsum.photos/seed/cyber/800/600",
    description:
      "Results of a controlled AI-driven cyberattack simulation designed to test modern enterprise defenses.",
    summary:
      "Inside a controlled red-team exercise where autonomous AI agents probed enterprise defenses — and what the results reveal about the future of cybersecurity.",
    tags: ["Cybersecurity", "Red Teaming", "AI Agents"],
    seoKeywords: [
      "AI red team",
      "cyberattack simulation",
      "enterprise security AI",
      "autonomous hacking",
    ],
  },
  {
    id: 8,
    title: "Blade Runner Blues and Butter Stars",
    slug: "blade-runner-blues-and-butter-stars",
    url: "https://spacepiratezero.substack.com/p/blade-runner-blues-and-butter-stars",
    date: "2026-01-08",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/6a526be2-fe51-43d1-be8b-b7ed47a148cf_665x1182.jpeg",
    description:
      "An atmospheric river, a robotaxi infestation, and the search for a dragon hat in San Francisco.",
    summary:
      "A travelogue through a rain-drenched, robotaxi-infested San Francisco — and what the city's surreal transformation reveals about our cyberpunk present.",
    tags: ["Travelogue", "Cyberpunk", "San Francisco"],
    seoKeywords: [
      "San Francisco robotaxi",
      "cyberpunk travel",
      "autonomous vehicles SF",
      "Waymo",
    ],
  },
  {
    id: 9,
    title: "Syntax is Dead: AI Vibe Coding",
    slug: "syntax-is-dead",
    url: "https://spacepiratezero.substack.com/p/syntax-is-dead",
    date: "2025-12-30",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/d46a244b-1186-478b-9b9b-fc1d57161397_2048x2048.png",
    description:
      "Rick Rubin just said the quiet part out loud: Coding isn't about syntax anymore.",
    summary:
      "Why AI-driven 'vibe coding' is the punk rock revolution of software development — and what it means when intent replaces syntax.",
    tags: ["Vibe Coding", "AI Development", "Punk Rock"],
    seoKeywords: [
      "vibe coding AI",
      "LLM programming",
      "Rick Rubin coding",
      "natural language development",
    ],
  },
  {
    id: 10,
    title: "The Ethical Architect's Stress Test",
    slug: "the-ethical-architects-stress-test",
    url: "https://spacepiratezero.substack.com/p/the-ethical-architects-stress-test",
    date: "2025-12-30",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/0de428bf-df55-40b1-910c-f708af9cef0e_2816x1536.png",
    description:
      "Are You Building Tools or Traps? A stress test for the developer's conscience.",
    summary:
      "A framework for developers to audit their own work: a stress test for distinguishing between tools that empower users and dark patterns that exploit them.",
    tags: ["Ethics", "Software Architecture", "Dark Patterns"],
    seoKeywords: [
      "software ethics",
      "dark patterns",
      "ethical developer",
      "AI architecture responsibility",
    ],
  },
  {
    id: 11,
    title: "The Red Roof Event Horizon",
    slug: "the-red-roof-event-horizon-why-90s",
    url: "https://spacepiratezero.substack.com/p/the-red-roof-event-horizon-why-90s",
    date: "2026-02-15",
    image: "https://picsum.photos/seed/pizza/800/600",
    description:
      "Why 90s Pizza Hut was peak civilization before the enshittification of dining.",
    summary:
      "A sociological autopsy of the 90s Pizza Hut experience — and what its decline tells us about the enshittification of every American institution.",
    tags: ["Nostalgia", "Sociology", "Pizza Hut"],
    seoKeywords: [
      "Pizza Hut nostalgia",
      "enshittification restaurants",
      "90s dining",
      "American culture decline",
    ],
  },
  {
    id: 12,
    title: "The Ghost in the Corporate Machine",
    slug: "the-ghost-in-the-corporate-machine",
    url: "https://spacepiratezero.substack.com/p/the-ghost-in-the-corporate-machine",
    date: "2026-02-21",
    image: "https://picsum.photos/seed/ghost/800/600",
    description:
      "How internal corporate data creates a digital mirror of company culture.",
    summary:
      "Enterprise AI trained on internal data doesn't just learn business rules — it absorbs and amplifies the full ghost of a company's culture, biases and all.",
    tags: ["Enterprise AI", "Corporate Culture", "AI Bias"],
    seoKeywords: [
      "enterprise AI bias",
      "corporate culture AI",
      "organizational data AI",
      "AI training data",
    ],
  },
  {
    id: 13,
    title: "Meatware is Hackable",
    slug: "meatware-is-hackable-lessons-from",
    url: "https://spacepiratezero.substack.com/p/meatware-is-hackable-lessons-from",
    date: "2026-02-23",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/4d506152-30af-4b7d-9d11-5ec8e7990f70_1024x1024.jpeg",
    description:
      "Billions are spent on firewalls while ignoring the most vulnerable part: the human brain.",
    summary:
      "The enterprise security industry spends billions on technical defenses while neglecting the most exploitable vulnerability in any network: the human employee.",
    tags: ["Social Engineering", "Cybersecurity", "Meatware"],
    seoKeywords: [
      "social engineering cybersecurity",
      "human hacking",
      "phishing attacks enterprise",
      "security awareness",
    ],
  },
  {
    id: 14,
    title: "Roast Lamb and the Art of Slowing Down",
    slug: "roast-lamb-tectonic-tantrums-and",
    url: "https://spacepiratezero.substack.com/p/roast-lamb-tectonic-tantrums-and",
    date: "2026-02-23",
    image: "https://picsum.photos/seed/lamb/800/600",
    description:
      "In a world moving at the speed of light, roasting a leg of lamb is a revolutionary gesture.",
    summary:
      "A meditation on slowness as radical resistance — told through the ritual of roasting a leg of lamb in a hyper-accelerated world.",
    tags: ["Cooking", "Slow Living", "Philosophy"],
    seoKeywords: [
      "slow food philosophy",
      "roast lamb recipe",
      "mindful cooking",
      "slow living resistance",
    ],
  },
  {
    id: 15,
    title: "Sofi's Origin Story",
    slug: "sofis-origin-story",
    url: "https://spacepiratezero.substack.com/p/sofis-origin-story",
    date: "2026-02-23",
    image:
      "https://substack-post-media.s3.amazonaws.com/public/images/a662a87a-e7a5-4e27-9d70-b77d475fbf45_2048x1536.jpeg",
    description:
      "The specific, kinetic moment of connection that transformed a rescue dog into a family member.",
    summary:
      "The story of a single kinetic moment at a rescue shelter that transformed a fearful stray into an irreplaceable family member.",
    tags: ["Pets", "Dog Adoption", "Personal Essay"],
    seoKeywords: [
      "dog adoption story",
      "rescue dog",
      "personal essay pets",
      "animal rescue",
    ],
  },
  {
    id: 16,
    title: "Real-Time Observational Data",
    slug: "why-real-time-observational-data",
    url: "https://spacepiratezero.substack.com/p/why-real-time-observational-data",
    date: "2026-02-23",
    image: "https://picsum.photos/seed/data/800/600",
    description:
      "Enterprise AI suffers from a context gap. Real-time data captured through edge sensors is the missing ingredient.",
    summary:
      "Why enterprise AI deployments consistently underperform: the missing ingredient is real-time observational data from edge sensors in the physical world.",
    tags: ["Enterprise AI", "Edge Computing", "Data Strategy"],
    seoKeywords: [
      "edge computing AI",
      "real-time data enterprise",
      "IoT AI",
      "observational data sensors",
    ],
  },
  {
    id: 17,
    title: "The Nakamoto Illusion",
    slug: "the-nakamoto-illusion-unmasking-the",
    url: "https://spacepiratezero.substack.com/p/the-nakamoto-illusion-unmasking-the",
    date: "2025-04-02",
    image: "https://picsum.photos/seed/nakamoto/800/600",
    description:
      "Unmasking the Jack Dorsey Theory and the intersection of crypto career with cypherpunk movements.",
    summary:
      "A forensic investigation into the Jack Dorsey-Satoshi theory and what the cypherpunk ideology behind Bitcoin's creation tells us about its architect.",
    tags: ["Bitcoin", "Satoshi", "Jack Dorsey"],
    seoKeywords: [
      "Satoshi Nakamoto identity",
      "Jack Dorsey Bitcoin",
      "cypherpunk crypto",
      "Bitcoin origin",
    ],
  },
  {
    id: 18,
    title: "In the Shadows: Dark Web Part 2",
    slug: "in-the-shadows-how-ai-is-infiltrating-c21",
    url: "https://spacepiratezero.substack.com/p/in-the-shadows-how-ai-is-infiltrating-c21",
    date: "2025-04-09",
    image: "https://picsum.photos/seed/darkweb2/800/600",
    description:
      "The commercialization of generative AI within dark web forums and the rise of FraudGPT.",
    summary:
      "Part 2: The emergence of FraudGPT and the full commercialization of generative AI as a service within dark web criminal marketplaces.",
    tags: ["Dark Web", "Cybercrime", "FraudGPT"],
    seoKeywords: [
      "FraudGPT dark web",
      "generative AI crime",
      "criminal AI marketplace",
      "dark web AI",
    ],
  },
  {
    id: 19,
    title: "The Prompt is the Payload",
    slug: "the-prompt-is-the-payload-weaponizing",
    url: "https://spacepiratezero.substack.com/p/the-prompt-is-the-payload-weaponizing",
    date: "2025-04-16",
    image: "https://picsum.photos/seed/payload/800/600",
    description:
      "In the era of LLMs, the line between data and code has blurred. Prompt Injection is critical.",
    summary:
      "In the LLM era, the distinction between data and code has collapsed. Prompt injection is the new SQL injection — and enterprises are dangerously unprepared.",
    tags: ["Prompt Injection", "AI Security", "LLM"],
    seoKeywords: [
      "prompt injection attack",
      "LLM security",
      "AI jailbreak",
      "large language model vulnerability",
    ],
  },
  {
    id: 20,
    title: "AI vs. AI: Law Enforcement",
    slug: "ai-vs-ai-how-law-enforcement-is-fighting",
    url: "https://spacepiratezero.substack.com/p/ai-vs-ai-how-law-enforcement-is-fighting",
    date: "2025-04-23",
    image: "https://picsum.photos/seed/aivsai/800/600",
    description:
      "Inside the tech-driven arms race between digital predators and digital protectors.",
    summary:
      "The AI arms race is playing out between law enforcement agencies and criminal networks — the side that iterates faster writes the rules.",
    tags: ["Law Enforcement", "Counter-AI", "Cybersecurity"],
    seoKeywords: [
      "AI law enforcement",
      "counter-AI crime",
      "police AI technology",
      "cybercrime detection",
    ],
  },
];

// ─── Export ──────────────────────────────────────────────────────────────────
// Use live Substack data when available, otherwise the curated static list.

const live = liveData as unknown as Dispatch[];

export const dispatches: Dispatch[] = live.length > 0 ? live : staticDispatches;
