import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'grid_view' },
  { label: 'Products', path: '/admin/products', icon: 'auto_awesome' },
  { label: 'Banners', path: '/admin/offers', icon: 'trending_up' },
  { label: 'Offers', path: '/admin/offers', icon: 'local_offer' },
  { label: 'Categories', path: '/admin/categories', icon: 'category' },
  { label: 'Settings', path: '/admin/settings', icon: 'settings' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleSignOut() {
    api.adminLogout();
    navigate('/admin');
  }

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-ash z-40">
      <div className="px-6 pt-8 pb-6">
        <Link to="/admin/dashboard" className="font-serif text-title-md font-bold text-ink-black tracking-tight">
          Upanishad Mobile Store
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Admin navigation">
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

      <div className="p-3 border-t border-ash">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-full text-smoke hover:bg-[#f5f5f5] hover:text-ink-black transition-colors"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span className="font-sans text-body-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
