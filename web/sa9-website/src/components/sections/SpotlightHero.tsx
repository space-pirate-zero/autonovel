"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

type Slide = {
  kicker: string;
  title: string;
  copy: string;
  image: string;
  accent: "pink" | "cyan" | "green" | "orange";
  ctas: { label: string; href: string; primary?: boolean }[];
};

const SLIDES: Slide[] = [
  {
    kicker: "● NOW STREAMING",
    title: "The Last Human CEO",
    copy: "A full-cast audiobook, narrated by Space Pirate Zero. Succession meets Flowers for Algernon, by way of a Twilight Zone broadcast. 29 episodes, streaming now.",
    image: "/images/scenes/07-lasthumanceo.png",
    accent: "pink",
    ctas: [
      { label: "Listen at lasthumanceo.com", href: "https://lasthumanceo.com", primary: true },
      { label: "Apple", href: "https://podcasts.apple.com/us/podcast/the-last-human-ceo/id6790448408" },
      { label: "Spotify", href: "https://open.spotify.com/show/033OSpl5KjvWx07upDLZ8M" },
    ],
  },
  {
    kicker: "● IN BETA",
    title: "StyleLift",
    copy: "The AI stylist that learns what you actually like. A 512-dimensional style DNA from 12 questions, virtual try-on, and budget-aware curation. Fashion is a data problem wearing a beautiful disguise.",
    image: "/images/scenes/01-stylelift.png",
    accent: "cyan",
    ctas: [
      { label: "Try StyleLift", href: "https://stylelift.fashion", primary: true },
      { label: "See it", href: "https://stylelift.fashion" },
    ],
  },
  {
    kicker: "● ON AMAZON NOW",
    title: "Digital Insurgency",
    copy: "The counterfeit world, mapped as a field manual for the ones fighting it. Business × cyberpunk × spec-ops — the Trojan Horse Protocol and how to smuggle the future past the corporate immune system.",
    image: "/images/scenes/10-studio.png",
    accent: "green",
    ctas: [
      { label: "Get it on Kindle", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate-ebook/dp/B0H4DLX478", primary: true },
      { label: "Paperback", href: "https://www.amazon.com/Digital-Insurgency-Smuggling-Authenticity-Corporate/dp/B0H4D92BSF" },
    ],
  },
  {
    kicker: "● NEW FLAGSHIP",
    title: "OSMIX",
    copy: "Suno gives you stems. Osmix gives you a session. One Rust engine turns an AI-generated track into a real multi-DAW session — stems, drums, tempo, MIDI, and a mastered mix.",
    image: "/images/scenes/05-osmix.png",
    accent: "orange",
    ctas: [{ label: "Explore OSMIX", href: "/sites/osmix", primary: true }],
  },
];

const accentText = {
  pink: "text-sa9-pink",
  cyan: "text-sa9-cyan",
  green: "text-sa9-green",
  orange: "text-sa9-orange",
};
const accentBorder = {
  pink: "border-sa9-pink",
  cyan: "border-sa9-cyan",
  green: "border-sa9-green",
  orange: "border-sa9-orange",
};
const dotBg = {
  pink: "bg-sa9-pink",
  cyan: "bg-sa9-cyan",
  green: "bg-sa9-green",
  orange: "bg-sa9-orange",
};

export function SpotlightHero() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = SLIDES.length;
  const go = useCallback((next: number) => setI(((next % n) + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % n), 5500);
    return () => clearInterval(id);
  }, [paused, n]);

  const s = SLIDES[i];

  return (
    <section
      data-section="spotlight"
      aria-roledescription="carousel"
      aria-label="Featured spotlight"
      className="relative border-b-3 border-sa9-border bg-sa9-surface-raised overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 data-grid-bg opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-16">
          {/* Copy */}
          <div key={i} className="flex-1 max-w-xl animate-fade-in-up">
            <div className={`font-mono text-xs uppercase tracking-[0.25em] mb-4 ${accentText[s.accent]}`}>
              {s.kicker} · FEATURED
            </div>
            <h2 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-sa9-text leading-[0.95] mb-5">
              {s.title}
            </h2>
            <p className="text-sa9-text-muted text-base sm:text-lg leading-relaxed mb-7">
              {s.copy}
            </p>
            <div className="flex flex-wrap gap-3">
              {s.ctas.map((c) => (
                <a
                  key={c.href}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta={`spotlight:${s.title}:${c.label}`}
                  className={
                    c.primary
                      ? `shine font-display font-bold uppercase tracking-wider text-sm px-6 py-3 border-3 ${accentBorder[s.accent]} ${accentText[s.accent]} bg-sa9-surface hover:bg-sa9-surface-overlay transition-colors`
                      : "font-mono text-xs uppercase tracking-wide px-4 py-3 border-3 border-sa9-border text-sa9-text-muted hover:text-sa9-text hover:border-sa9-text-muted transition-colors"
                  }
                >
                  {c.label} →
                </a>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2 mt-8">
              {SLIDES.map((sl, idx) => (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Show ${sl.title}`}
                  onClick={() => go(idx)}
                  className={`h-2 transition-all duration-300 ${
                    idx === i ? `w-8 ${dotBg[s.accent]}` : "w-2 bg-sa9-border hover:bg-sa9-text-dim"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="flex-shrink-0 relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[26rem] lg:h-[26rem]">
            <div className={`absolute inset-0 border-3 ${accentBorder[s.accent]} opacity-30`} />
            <Image
              key={s.image}
              src={s.image}
              alt={s.title}
              fill
              className="object-contain p-3 animate-fade-in-up drop-shadow-[0_0_30px_rgba(255,20,147,0.2)]"
              sizes="(max-width: 1024px) 320px, 416px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
