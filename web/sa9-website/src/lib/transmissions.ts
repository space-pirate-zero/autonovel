// ═══════════════════════════════════════════════════════════
// TRANSMISSIONS — the Spaceship Alpha 9 storytelling studio
// Original IP: a field manual, a novel, a field course, an audio drama.
// Every release is "a Space Pirate Zero transmission."
// Ordered by publish date. Verified against live feeds + the autonovel repo.
// ═══════════════════════════════════════════════════════════

export type TransmissionKind =
  | "audiobook"
  | "audio-drama"
  | "field-course"
  | "book";

export type TransmissionStatus =
  | "streaming" // live podcast / on streaming now
  | "available" // buyable now (book)
  | "produced" // finished, release imminent
  | "in-production";

export type Accent = "pink" | "cyan" | "green" | "purple" | "orange" | "yellow";

export interface ListenLink {
  label: string;
  href: string;
}

export interface Transmission {
  id: string;
  title: string;
  slug: string;
  kicker: string;
  kind: TransmissionKind;
  status: TransmissionStatus;
  logline: string;
  description: string;
  comps?: string;
  year: string;
  episodes?: number;
  runtime?: string;
  genre: string;
  cover?: string;
  trailer?: string; // mp4 URL — plays inline on the card
  accent: Accent;
  comingSoon?: boolean; // blurred details + "coming soon" banner, no links
  links: ListenLink[];
}

// Order = publish date: Digital Insurgency → The Last Human CEO →
// Defense Against the Dark Arts → The Maneki Neko Death Cult.
export const transmissions: Transmission[] = [
  {
    id: "digital-insurgency",
    title: "Digital Insurgency",
    slug: "digital-insurgency",
    kicker: "THE FIELD MANUAL",
    kind: "book",
    status: "available",
    logline:
      "The counterfeit world, mapped as a field manual for the ones fighting it.",
    description:
      "Business × cyberpunk × spec-ops. A survival guide for digital insurgents operating behind enterprise lines — the Trojan Horse Protocol, the MBA Efficiency Paradox, and how to smuggle the future past the corporate immune system. A companion 30-day dispatch series runs on Substack.",
    year: "2026",
    genre: "Business cyberpunk field manual",
    cover: "/images/covers/digital-insurgency.jpg",
    accent: "green",
    links: [
      { label: "Kindle", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate-ebook/dp/B0H4DLX478" },
      { label: "Paperback", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate/dp/B0H4D92BSF" },
      { label: "Dispatches", href: "https://spacepiratezero.substack.com" },
    ],
  },
  {
    id: "the-last-human-ceo",
    title: "The Last Human CEO",
    slug: "the-last-human-ceo",
    kicker: "NOW STREAMING",
    kind: "audiobook",
    status: "streaming",
    logline:
      "The last human chief executive in the Fortune 100 wages a manic crusade to prove a person still belongs in the chair.",
    description:
      "In 2027, as corporate boards swap their CEOs for cheaper, scandal-proof AI, Prescott 'Cope' Mercer IV — a charming, coke-addled fourth-generation Atlanta heir — fights to stay human, right up until the machine taking his job quietly uncovers the thing he buried that got two people killed. A full-cast audiobook, narrated by Space Pirate Zero.",
    comps: "Succession meets Flowers for Algernon, by way of a Twilight Zone broadcast.",
    year: "2026",
    episodes: 29,
    runtime: "~12.6h",
    genre: "Tragic dark comedy",
    cover: "/images/covers/the-last-human-ceo-anime.jpg",
    trailer: "https://storage.googleapis.com/spz-podcasts/the-last-human-ceo/video/trailer.mp4",
    accent: "pink",
    links: [
      { label: "lasthumanceo.com", href: "https://lasthumanceo.com" },
      { label: "Apple Podcasts", href: "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408" },
      { label: "Spotify", href: "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M" },
      { label: "Kindle", href: "https://www.amazon.com/dp/B0H5YVJY3Z" },
      { label: "Amazon", href: "https://www.amazon.com/dp/B0H6LCDJ9H" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/gregchambers/" },
    ],
  },
  {
    id: "defense-against-the-dark-arts",
    title: "Defense Against the Dark Arts",
    slug: "defense-against-the-dark-arts",
    kicker: "COMING SOON",
    kind: "field-course",
    status: "produced",
    logline:
      "A training class for the general public in the dark arts of influence — and how to see every move coming.",
    description:
      "Thirteen modules teach how manipulation actually works: cold reading, gaslighting and DARVO, the liar's dividend, radicalization funnels, astroturf, deepfakes. How to spot each move, how to defuse it, and how to stay free. Nonfiction, narrated by Space Pirate Zero.",
    year: "2026",
    episodes: 14,
    runtime: "13 modules",
    genre: "Nonfiction field course",
    cover: "/images/covers/defense-dark-arts.jpg",
    accent: "cyan",
    comingSoon: true,
    links: [],
  },
  {
    id: "maneki-neko-death-cult",
    title: "The Maneki Neko Death Cult",
    slug: "maneki-neko-death-cult",
    kicker: "COMING SOON",
    kind: "audio-drama",
    status: "produced",
    logline:
      "Twenty-four doors of an Advent calendar of death — each a dead-artist 'saint,' each a jump to another era and city.",
    description:
      "A scored, serialized audio drama in three acts — The Fog, The Mastery, The Refusal. Space Pirate Zero is the time-slipper who burns himself down to jump, chasing a signal across the wreckage of the 20th century. Twenty-four episodes, fully produced.",
    comps: "A Twilight Zone fable stitched into a concept album.",
    year: "2026",
    episodes: 24,
    runtime: "~10.5h",
    genre: "Scored audio drama",
    cover: "/images/covers/maneki-neko-death-cult-art.webp",
    accent: "purple",
    comingSoon: true,
    links: [],
  },
];

export const streamingNow = transmissions.filter((t) => t.status === "streaming");

export function getTransmissionBySlug(slug: string): Transmission | undefined {
  return transmissions.find((t) => t.slug === slug);
}
