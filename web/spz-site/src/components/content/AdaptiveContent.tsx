
import { BaseContent } from '@/types/content';
import { ContentDisplay } from './ContentDisplay';

interface AdaptiveContentProps {
  content: BaseContent;
}

export function AdaptiveContent({ content }: AdaptiveContentProps) {
  return <ContentDisplay content={content} />;
}
