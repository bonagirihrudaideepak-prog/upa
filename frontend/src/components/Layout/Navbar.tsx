import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Category } from '../../types';

interface NavbarProps {
  categories: Category[];
  loading?: boolean;
}

function NavbarSkeleton() {
  return (
    <div className="flex gap-2 px-gutter py-2.5 overflow-hidden bg-cream-paper border-b border-ash">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-24 rounded-full bg-ash/50 animate-pulse shrink-0"
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
    <div className="sticky top-[84px] md:top-[92px] z-40 bg-cream-paper/95 backdrop-blur-md border-b border-ash shadow-sm transition-all duration-300">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-gutter py-2.5 max-w-container mx-auto"
      >
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className={`shrink-0 font-sans text-label-sm font-semibold px-4 py-1.5 rounded-full border transition-all whitespace-nowrap ${
              activeSlug === cat.slug
                ? 'bg-ink-black border-ink-black text-white shadow-sm'
                : 'bg-white border-ash text-smoke hover:text-ink-black hover:border-ink-black'
            }`}
          >
            {cat.name}
          </Link>
        ))}
        <Link
          to="/catalog"
          className={`shrink-0 font-sans text-label-sm font-semibold px-4 py-1.5 rounded-full border transition-all ${
            !activeSlug
              ? 'bg-ink-black border-ink-black text-white shadow-sm'
              : 'bg-white border-ash text-smoke hover:text-ink-black hover:border-ink-black'
          }`}
        >
          All Products
        </Link>
      </div>
    </div>
  );
}
