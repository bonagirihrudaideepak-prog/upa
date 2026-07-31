import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../Search/SearchBar';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-50 bg-ink-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-cream-paper border-r border-ash transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation menu"
        aria-modal="true"
        role="dialog"
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex items-center justify-between px-gutter h-14 border-b border-ash">
            <span className="font-serif text-title-sm text-ink-black">Categories & Menu</span>
            <button
              onClick={onClose}
              className="p-1 -mr-1"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-ink-black text-2xl">close</span>
            </button>
          </div>

          {/* Search */}
          <div className="px-gutter pt-4 pb-3">
            <SearchBar fullWidth onSearch={onClose} />
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-gutter py-2" aria-label="Mobile navigation">
            <div className="flex flex-col gap-0.5">
              <Link
                to="/"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/category/iphone"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                iPhone
              </Link>
              <Link
                to="/category/samsung"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                Samsung
              </Link>
              <Link
                to="/category/accessories"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                Accessories
              </Link>
              <Link
                to="/category/gadgets"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                Gadgets
              </Link>
              <Link
                to="/category/others"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                Others
              </Link>
              <Link
                to="/catalog?filter=new-arrivals"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                to="/catalog?filter=offers"
                onClick={onClose}
                className="font-sans text-body-md text-ink-black py-2.5 hover:text-smoke transition-colors"
              >
                Offers
              </Link>
            </div>

            <hr className="border-ash my-4" />

            <div className="flex flex-col gap-1">
              <Link
                to="/admin"
                onClick={onClose}
                className="font-sans text-body-sm text-smoke py-2 hover:text-ink-black transition-colors"
              >
                Admin Panel Login
              </Link>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
