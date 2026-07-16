
import Link from 'next/link';
import { BaseContent } from '@/types/content';
import Image from 'next/image';

interface ContentPreviewProps {
  content: BaseContent;
}

export function ContentPreview({ content }: ContentPreviewProps) {
  return (
    <Link href={`/content/${content.type.toLowerCase()}/${content.slug}`}>
        <div className="bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
            <Image src={content.coverImage} alt={content.title} width={500} height={300} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-bold text-white">{content.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{content.type}</p>
                <p className="text-gray-300 mt-2 line-clamp-2">{content.description}</p>
            </div>
        </div>
    </Link>
  );
}
