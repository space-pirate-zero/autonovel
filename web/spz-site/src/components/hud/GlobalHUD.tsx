
'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Cpu,
  Music,
  BookOpen,
  Share2,
  Clock,
  X,
  ChevronRight,
  Mail,
  Newspaper,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { BaseContent } from '@/types/content';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ContactForm } from './ContactForm';
import { trackNavClick, trackContentView } from '@/lib/analytics';

const ICON_MAP: Record<string, LucideIcon> = {
  'brands': Terminal,
  'books': BookOpen,
  'music': Music,
  'articles': Cpu,
  'press': Newspaper,
  'social': Share2,
};

const COLOR_MAP: Record<string, string> = {
  'brands': 'text-cyber-cyan',
  'books': 'text-cyber-magenta',
  'music': 'text-cyber-cyan',
  'articles': 'text-cyber-magenta',
  'press': 'text-cyber-cyan',
  'social': 'text-cyber-cyan',
};

export function GlobalHUD({ allContent, categories }: { allContent: BaseContent[], categories: string[] }) {
  const [time, setTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredContent = selectedCategory 
    ? allContent.filter(item => {
        const cat = selectedCategory.toLowerCase();
        const subtype = item.subtype?.toLowerCase() || '';
        
        if (cat === 'articles') {
          return subtype === 'article' || subtype === 'patent';
        }
        
        if (cat === 'press') {
          return subtype === 'press' || subtype.includes('video');
        }
        
        if (cat === 'brands') return item.type === 'Brand';
        if (cat === 'books') return item.type === 'Book';
        if (cat === 'music') return item.type === 'Music';
        if (cat === 'social') return item.type === 'Social';
        
        return item.type.toLowerCase() === cat;
      })
    : [];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-0 left-0 w-full h-auto flex flex-col md:flex-row items-center justify-between px-4 md:px-8 glass-hud pointer-events-auto border-b border-cyber-cyan/20">
        <div className="flex items-center justify-between w-full md:w-auto py-2">
          <Link href="/" className="font-headline text-sm md:text-lg tracking-tighter text-white hover:text-cyber-cyan transition-colors group">
            SPACE_PIRATE_<span className="text-cyber-magenta group-hover:animate-glitch inline-block">ZERO</span>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 md:gap-4 py-2 md:py-0">
          {categories.map((cat, idx) => {
            const Icon = ICON_MAP[cat];
            if (!Icon) return null;
            return (
              <button
                key={idx}
                onClick={() => { const next = selectedCategory === cat ? null : cat; if (next) trackNavClick(next); setSelectedCategory(next); }}
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass-hud border transition-all group relative",
                  selectedCategory === cat ? "border-cyber-cyan scale-110 bg-cyber-cyan/10" : "border-cyber-cyan/20 hover:border-cyber-cyan hover:scale-110"
                )}
                title={cat}
              >
                <Icon size={18} className={cn(COLOR_MAP[cat], "group-hover:animate-glitch")} />
                <div className="absolute top-full mt-2 px-2 py-1 bg-cyber-cyan text-black text-[8px] font-headline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase">
                  {cat}_STREAM
                </div>
              </button>
            );
          })}
          
          <ContactForm trigger={
            <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass-hud border border-cyber-cyan/20 hover:border-cyber-cyan hover:scale-110 transition-all group relative">
              <Mail size={18} className="text-white hover:text-cyber-cyan" />
              <div className="absolute top-full mt-2 px-2 py-1 bg-cyber-cyan text-black text-[8px] font-headline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                CONTACT
              </div>
            </button>
          } />
        </div>

        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse shadow-[0_0_8px_#00FFFF]" />
            <span className="font-headline text-[10px] tracking-widest text-cyber-cyan">SYSTEM: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 font-headline text-[10px] text-cyber-cyan/70">
            <Clock size={14} />
            <span className="tabular-nums">UTC_{time}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] md:w-96 glass-hud border border-cyber-cyan/30 p-6 pointer-events-auto"
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="font-headline text-xs text-cyber-cyan tracking-widest">{selectedCategory.toUpperCase()}_STREAM</span>
              <button onClick={() => setSelectedCategory(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {filteredContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.type.toLowerCase()}/${item.slug}`}
                  onClick={() => { trackContentView(item.id, item.type, item.title, 'hud_nav'); setSelectedCategory(null); }}
                  className="flex items-center justify-between group p-2 hover:bg-white/5 border border-transparent hover:border-cyber-cyan/20 transition-all"
                >
                  <span className="text-xs font-headline text-white/70 group-hover:text-cyber-cyan truncate">{item.title}</span>
                  <ChevronRight size={14} className="text-cyber-magenta opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
              ))}
              {filteredContent.length === 0 && (
                <div className="py-10 text-center text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  No data detected in this stream.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
