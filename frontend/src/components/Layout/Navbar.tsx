import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Category } from '../../types';

interface NavbarProps {
  categories: Category[];
  loading?: boolean;
}

function NavbarSkeleton() {
  return (
    <div className="flex gap-2 px-gutter py-2 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-9 w-24 rounded-full bg-ash/50 animate-pulse shrink-0"
        />
      ))}
    </div>
  );
}

export default function Navbar({ categories, loading }: NavbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const activeSlug = location.pathname.startsWith('/category/')
    ? location.pathname.replace('/category/', '')
    : null;

  if (loading) return <NavbarSkeleton />;
  if (!categories || categories.length === 0) return null;

  return (
    <div className="sticky top-14 md:top-16 z-40 bg-cream-paper/90 backdrop-blur-sm border-b border-ash">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-gutter py-2 max-w-container mx-auto"
      >
        <Link
          to="/catalog"
          className={`shrink-0 font-sans text-label-sm px-4 py-1.5 rounded-full border transition-colors ${
            !activeSlug
              ? 'bg-white border-ash text-ink-black'
              : 'bg-transparent border-ash text-smoke hover:text-ink-black'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`shrink-0 font-sans text-label-sm px-4 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              activeSlug === cat.slug
                ? 'bg-white border-ash text-ink-black'
                : 'bg-transparent border-ash text-smoke hover:text-ink-black'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
