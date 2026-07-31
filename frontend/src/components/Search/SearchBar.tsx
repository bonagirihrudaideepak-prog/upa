import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder = 'Search deepak electronics',
  fullWidth = false,
  className = '',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/catalog?q=${encodeURIComponent(trimmed)}`);
    }
    inputRef.current?.blur();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 bg-white border border-ash rounded-full px-4 h-10 ${
        fullWidth ? 'w-full' : 'w-full'
      } ${className}`}
      role="search"
    >
      <span className="material-symbols-outlined text-smoke text-lg shrink-0">search</span>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none font-sans text-body-sm text-charcoal placeholder:text-charcoal/50 min-w-0"
        aria-label="Search products"
      />
    </form>
  );
}
