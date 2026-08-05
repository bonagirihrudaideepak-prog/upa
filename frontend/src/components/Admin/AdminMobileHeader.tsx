import { Link } from 'react-router-dom';

interface Props {
  onMenuToggle?: () => void;
}

export default function AdminMobileHeader({ onMenuToggle }: Props) {
  return (
    <header className="md:hidden flex items-center justify-between px-gutter h-14 bg-cream-paper border-b border-ash fixed top-0 left-0 right-0 z-30">
      <button
        onClick={onMenuToggle}
        className="p-1 -ml-1"
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-ink-black text-2xl">menu</span>
      </button>

      <Link to="/admin/dashboard" className="font-serif text-title-md font-bold text-ink-black tracking-tight">
        Upanishad mobiles
      </Link>

      <Link to="/admin/settings" className="p-1 -mr-1" aria-label="Settings">
        <span className="material-symbols-outlined text-ink-black text-2xl">settings</span>
      </Link>
    </header>
  );
}

