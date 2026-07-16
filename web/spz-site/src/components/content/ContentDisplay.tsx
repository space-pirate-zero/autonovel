
import { 
  BaseContent, 
  BrandWork, 
  BookContent, 
  MusicContent,
  PodcastContent,
  ArticleContent,
  SocialContent
} from '@/types/content';
import { BrandWorkDisplay } from './BrandWorkDisplay';
import { BookContentDisplay } from './BookContentDisplay';
import { MusicContentDisplay } from './MusicContentDisplay';
import { PodcastContentDisplay } from './PodcastContentDisplay';
import { ArticleContentDisplay } from './ArticleContentDisplay';
import { SocialContentDisplay } from './SocialContentDisplay';

interface ContentDisplayProps {
  content: BaseContent;
}

export function ContentDisplay({ content }: ContentDisplayProps) {
  switch (content.type) {
    case 'Brand':
      return <BrandWorkDisplay content={content as BrandWork} />;
    case 'Book':
      return <BookContentDisplay content={content as BookContent} />;
    case 'Music':
      return <MusicContentDisplay content={content as MusicContent} />;
    case 'Podcast':
      return <PodcastContentDisplay content={content as PodcastContent} />;
    case 'Article':
      return <ArticleContentDisplay content={content as ArticleContent} />;
    case 'Social':
        return <SocialContentDisplay content={content as SocialContent} />;
    default:
      return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center px-6">
          <div className="text-center space-y-4 border border-cyber-magenta/30 glass-hud p-12">
            <div className="text-[10px] tracking-[0.3em] font-headline text-cyber-magenta uppercase">
              ERROR // UNKNOWN_CONTENT_TYPE
            </div>
            <p className="font-mono text-sm text-white/40">
              Transmission format not recognized. Signal lost.
            </p>
          </div>
        </div>
      );
  }
}
