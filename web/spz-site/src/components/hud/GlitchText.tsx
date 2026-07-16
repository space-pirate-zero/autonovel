'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const EFFECTS = ['glitch-1', 'glitch-2', 'glitch-3', 'font-mono', 'font-headline', 'text-cyber-magenta', 'text-cyber-cyan', 'text-lg', 'text-sm'];

export function GlitchText({ text, className }: { text: string, className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial render — no React re-renders needed
    container.innerHTML = text.split('').map(char =>
      `<span>${char === ' ' ? ' ' : char}</span>`
    ).join('');

    const interval = setInterval(() => {
      const spans = container.querySelectorAll('span');
      spans.forEach((span, i) => {
        const char = text[i];
        if (!char || char === ' ' || Math.random() > 0.05) {
          span.className = '';
          return;
        }
        span.className = EFFECTS[Math.floor(Math.random() * EFFECTS.length)];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [text]);

  return <span ref={containerRef} className={cn('inline-block', className)} />;
}
