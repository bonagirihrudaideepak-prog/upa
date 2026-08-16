import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid_view' },
  { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
  { label: 'Banners & Offers', path: '/admin/offers', icon: 'campaign' },
  { label: 'Categories', path: '/admin/categories', icon: 'category' },
  { label: 'System Health', path: '/admin/system-health', icon: 'health_and_safety' },
  { label: 'Website Settings', path: '/admin/settings', icon: 'tune' },
];

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { storeName } = useApp();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleSignOut() {
    api.adminLogout();
    navigate('/admin');
  }

  return (
    <>
      {/* Mobile Header with Hamburger Menu Toggle */}
      <header className="md:hidden flex items-center justify-between px-gutter h-14 bg-cream-paper border-b border-ash fixed top-0 left-0 right-0 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1 -ml-1 flex items-center justify-center text-ink-black"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <Link to="/admin/dashboard" className="font-serif text-title-md font-bold text-ink-black tracking-tight">
          {storeName}
        </Link>

        <Link to="/admin/settings" className="p-1 -mr-1" aria-label="Settings">
          <span className="material-symbols-outlined text-ink-black text-2xl">settings</span>
        </Link>
      </header>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink-black/50 backdrop-blur-sm md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Slide-out Drawer) */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-ash z-50 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <Link to="/admin/dashboard" className="font-serif text-title-md font-bold text-ink-black tracking-tight">
            {storeName}
        </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-smoke hover:text-ink-black"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? 'bg-[#004ac6]/10 text-[#004ac6] font-medium'
                    : 'text-smoke hover:bg-[#f5f5f5] hover:text-ink-black'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className="font-sans text-body-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ash space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-full text-smoke hover:bg-[#f5f5f5] hover:text-ink-black transition-colors"
          >
            <span className="material-symbols-outlined text-xl">storefront</span>
            <span className="font-sans text-body-sm">View Store</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-smoke hover:bg-[#f5f5f5] hover:text-ink-black transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="font-sans text-body-sm">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
