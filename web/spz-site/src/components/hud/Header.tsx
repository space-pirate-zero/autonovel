
'use client';

import { GlitchText } from './GlitchText';

interface HeaderProps {
    categories: string[];
}

const Header = ({ categories }: HeaderProps) => {

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
      <div className="text-lg font-bold">
        <a href="/">
          <GlitchText text="GREG CHAMBERS" />
        </a>
      </div>
      <nav>
        <ul className="flex space-x-4">
          {categories.map(item => (
            <li key={item}>
              <a href={`/content/${item.toLowerCase()}`} className="hover:text-gray-400">
                {item.replace(/_/g, ' ').toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export { Header };
