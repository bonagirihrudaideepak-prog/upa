import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from '../Search/SearchBar';
import MobileMenu from './MobileMenu';
import ScrollingDeals from '../Social/ScrollingDeals';
import { api } from '../../utils/api';
import type { Category } from '../../types';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  const activeSlug = location.pathname.startsWith('/category/')
    ? location.pathname.replace('/category/', '')
    : null;

  useEffect(() => {
    setMounted(true);
    setPrevScrollY(window.scrollY);
    api.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > 80 && current > prevScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setPrevScrollY(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY, mounted]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-cream-paper border-b border-ash transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Infinite Marquee Ticker at Top */}
        <ScrollingDeals />

        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between px-gutter h-14 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 -ml-1"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-ink-black text-2xl">menu</span>
          </button>

          <Link to="/" className="font-serif text-title-md text-ink-black tracking-tight font-bold">
            UPANISHAD MOBILE STORE
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="p-1 -mr-1"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-ink-black text-2xl">
                {mobileSearchOpen ? 'close' : 'search'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay Bar */}
        {mobileSearchOpen && (
          <div className="px-gutter pb-3 pt-1 md:hidden bg-cream-paper border-b border-ash animate-fadeIn">
            <SearchBar fullWidth onSearch={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* Desktop Header Bar (Logo, SearchBar & Category Navigation) */}
        <div className="hidden md:flex items-center justify-between h-16 px-margin max-w-container mx-auto">
          <Link to="/" className="font-serif text-title-lg text-ink-black tracking-tight shrink-0 font-bold">
            UPANISHAD MOBILE STORE
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <SearchBar />
          </div>

          {/* Desktop Laptop View Categories Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <Link
              to="/catalog"
              className={`shrink-0 font-sans text-label-sm font-semibold px-3 py-1.5 rounded-full border transition-all ${
                !activeSlug
                  ? 'bg-ink-black border-ink-black text-white shadow-sm'
                  : 'bg-white border-ash text-smoke hover:text-ink-black hover:border-ink-black'
              }`}
            >
              All Products
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`shrink-0 font-sans text-label-sm font-semibold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                  activeSlug === cat.slug
                    ? 'bg-ink-black border-ink-black text-white shadow-sm'
                    : 'bg-white border-ash text-smoke hover:text-ink-black hover:border-ink-black'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
