"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Poster-first trailer player. Always renders the cover image (via next/image,
 * so it never shows a blank <video> box), with a neon play button. Clicking
 * swaps in the actual <video> and autoplays it. Falls back to just the cover
 * when no trailer is provided.
 */
export function TrailerPlayer({
  cover,
  trailer,
  title,
  accent = "#ff1493",
}: {
  cover: string;
  trailer?: string;
  title: string;
  accent?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing && trailer) {
    return (
      <video
        src={trailer}
        poster={cover}
        controls
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => trailer && setPlaying(true)}
      aria-label={trailer ? `Play the ${title} trailer` : title}
      className="group relative block w-full h-full cursor-pointer focus:outline-none"
      disabled={!trailer}
    >
      <Image
        src={cover}
        alt={`${title} cover art`}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 640px) 100vw, 240px"
      />
      {trailer && (
        <>
          <span className="absolute inset-0 bg-sa9-surface/20 group-hover:bg-sa9-surface/10 transition-colors" />
          <span
            className="absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span
              className="flex items-center justify-center w-16 h-16 border-3 bg-sa9-surface/80 backdrop-blur-sm shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:scale-110 animate-neon-pulse"
              style={{ borderColor: accent }}
            >
              <span
                className="ml-1 w-0 h-0"
                style={{
                  borderTop: "12px solid transparent",
                  borderBottom: "12px solid transparent",
                  borderLeft: `20px solid ${accent}`,
                }}
              />
            </span>
          </span>
          <span
            className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest"
            style={{ color: accent }}
          >
            ▶ Watch trailer
          </span>
        </>
      )}
    </button>
  );
}
