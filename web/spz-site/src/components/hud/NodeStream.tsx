'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BaseContent } from '@/types/content';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackContentView } from '@/lib/analytics';

// Memoized item component to prevent re-rendering of the entire list
const NodeStreamItem = React.memo(function NodeStreamItem({ content }: { content: BaseContent }) {
  // Robust image sanitization
  const isUrlValid = content.coverImage && typeof content.coverImage === 'string' && content.coverImage.length > 0;
  const isImageUrl = isUrlValid && !content.coverImage.endsWith('.mp3') && !content.coverImage.endsWith('.wav');
  const safeImage = isImageUrl ? content.coverImage : `https://picsum.photos/seed/${content.id}/400/400`;

  // Format date on client to avoid hydration mismatch
  const dateObj = new Date(content.timestamp);
  const displayDate = isNaN(dateObj.getTime()) 
    ? 'ARCHIVE.NODE' 
    : dateObj.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 border-b border-white/5 group relative overflow-hidden transition-all duration-300 hover:bg-white/5",
        content.paletteVariant === 'Cyan' ? "hover:border-l-2 hover:border-l-cyber-cyan" : "hover:border-l-2 hover:border-l-cyber-magenta"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 border border-white/10 shrink-0 bg-black overflow-hidden rounded-sm">
          <Image 
            src={safeImage} 
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
            alt={content.title || "Content Thumbnail"} 
            unoptimized
            data-ai-hint="content cover"
          />
        </div>
        <div className="min-w-0 flex-grow">
          <div className={cn(
            "text-[8px] font-headline mb-0.5 uppercase tracking-[0.2em]", 
            content.paletteVariant === 'Cyan' ? "text-cyber-cyan" : "text-cyber-magenta"
          )}>
            {content.type}
          </div>
          <h4 className="text-[11px] font-headline text-white/90 truncate group-hover:text-white leading-tight">
            {content.title}
          </h4>
          <div className="text-[9px] font-mono text-white/30 mt-1 uppercase">
            {displayDate}
          </div>
        </div>
        <Link
          href={`/content/${content.type.toLowerCase()}/${content.slug}`}
          onClick={() => trackContentView(content.id, content.type, content.title, 'node_stream')}
          className="p-1.5 rounded-full border border-white/5 text-white/20 group-hover:text-cyber-cyan group-hover:border-cyber-cyan/30 transition-all"
        >
          <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
});

export function NodeStream({ allContent = [] }: { allContent?: BaseContent[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoading(false);
  }, []);

  // Memoize the sorted stream to prevent re-sorting on every render
  const sortedStream = useMemo(() => {
    if (!allContent || allContent.length === 0) {
      return [];
    }
    return [...allContent].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allContent]);

  useEffect(() => {
    if(sortedStream.length > 0) {
      setIsLoading(false);
    }
  }, [sortedStream]);

  if (!mounted) return null;

  if (isLoading && sortedStream.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center space-y-4">
        <Loader2 className="text-cyber-magenta animate-spin w-6 h-6" />
        <div className="font-headline text-[10px] text-white/20 tracking-[0.5em] uppercase animate-pulse">
          CONNECTING_NODE_UPLINK...
        </div>
      </div>
    );
  }

  if (sortedStream.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-10 text-center opacity-40">
        <div className="font-headline text-[10px] tracking-widest uppercase mb-2">NO_SIGNALS_DETECTED</div>
        <div className="font-mono text-[8px] uppercase">Awaiting transmissions from the void...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
      <AnimatePresence initial={false}>
        {sortedStream.map(content => (
          <NodeStreamItem key={content.id} content={content} />
        ))}
      </AnimatePresence>
    </div>
  );
}
