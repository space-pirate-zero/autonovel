
'use client'

import { useState } from 'react';
import { GlobalHUD } from '@/components/hud/GlobalHUD';
import { Bio } from '@/components/hud/Bio';
import { WaterfallGame } from '@/components/waterfall/GameEngine';
import { NodeStream } from '@/components/hud/NodeStream';
import { Footer } from '@/components/hud/Footer';
import { BaseContent } from '@/types/content';
import { trackGameBrick } from '@/lib/analytics';

export function GameUI({ initialContent }: { initialContent: BaseContent[] }) {
  const [nodeStreamContent, setNodeStreamContent] = useState<BaseContent[]>([]);

  const handleBrickDestroyed = (content: BaseContent) => {
    trackGameBrick(content.id, content.type, content.title);
    setNodeStreamContent(prevContent => {
      if (prevContent.some(c => c.id === content.id)) return prevContent;
      return [content, ...prevContent];
    });
  };

  return (
    <main className="relative min-h-screen w-full bg-cyber-black flex flex-col font-body overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <GlobalHUD 
        allContent={initialContent} 
        categories={['brands', 'books', 'music', 'articles', 'press', 'social']} 
      />
      
      {/* Main Interface Layout */}
      <div className="flex-grow flex flex-col lg:flex-row w-full pt-20 pb-4 px-4 lg:px-6 gap-6 lg:h-[calc(100vh-100px)] overflow-hidden">
        
        {/* Left Column: Personnel Identity (Bio) */}
        <aside className="hidden lg:flex flex-col w-full lg:w-[32%] xl:w-[30%] h-full animate-in slide-in-from-left duration-700">
          <div className="flex-1 min-h-0 bg-black/40 border border-white/5 glass-hud rounded-sm overflow-hidden">
            <Bio />
          </div>
        </aside>

        {/* Center Column: Tactical Visualization (The Game) */}
        <section className="flex-grow flex flex-col h-[60vh] lg:h-full relative z-10 animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex-1 bg-black/60 border border-cyber-cyan/10 glass-hud rounded-sm relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/50" />
                </div>
                <span className="text-[10px] font-headline text-cyber-cyan tracking-[0.3em] uppercase">Tactical_Visualizer_V.5</span>
              </div>
              <div className="hidden sm:block text-[9px] font-mono text-white/30 tracking-widest uppercase">Input: Mouse_Shield_Active</div>
            </div>
            
            <div className="flex-1 min-h-0 w-full relative bg-black/40">
              <WaterfallGame content={initialContent} onBrickDestroyed={handleBrickDestroyed} />
            </div>
          </div>
        </section>

        {/* Right Column: Node Stream (Live Transmissions) */}
        <aside className="w-full lg:w-1/4 xl:w-1/5 flex flex-col h-[500px] lg:h-full animate-in slide-in-from-right duration-700">
          <div className="flex-1 min-h-0 bg-black/40 border border-white/5 glass-hud rounded-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/5 flex-shrink-0">
              <div className="font-headline text-[10px] text-cyber-magenta tracking-[0.3em] uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full border border-cyber-magenta animate-spin-slow" />
                Live_Node_Stream
              </div>
              <div className="w-3 h-[1px] bg-cyber-magenta/50" />
            </div>
            
            <NodeStream allContent={nodeStreamContent} />
          </div>
        </aside>

        {/* Bio (Mobile only) */}
        <aside className="lg:hidden w-full h-auto glass-hud border border-white/5 rounded-sm p-4">
            <Bio />
        </aside>
      </div>

      <Footer />
    </main>
  );
}
