import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../Search/SearchBar';
import MobileMenu from './MobileMenu';
import ScrollingDeals from '../Social/ScrollingDeals';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    setPrevScrollY(window.scrollY);
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
              onClick={() => navigate('/catalog')}
              className="p-1 -mr-1"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-ink-black text-2xl">search</span>
            </button>
          </div>
        </div>

        {/* Desktop Header Bar */}
        <div className="hidden md:flex items-center justify-between h-16 px-margin max-w-container mx-auto">
          <Link to="/" className="font-serif text-title-lg text-ink-black tracking-tight shrink-0 font-bold">
            UPANISHAD MOBILE STORE
          </Link>

          <div className="flex-1 max-w-md mx-8">
            <SearchBar />
          </div>
        </div>
      </header>

      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
