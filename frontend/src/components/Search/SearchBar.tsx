import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getImageUrl } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../types';

interface SearchBarProps {
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBar({
  placeholder,
  fullWidth = false,
  className = '',
  onSearch,
}: SearchBarProps) {
  const { searchPlaceholder } = useApp();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }

    if (isFocused) {
      setShowDropdown(true);
      setLoading(true);

      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = window.setTimeout(async () => {
        try {
          const res = await api.searchProducts(trimmedQuery);
          if (res.success && res.data) {
            setSuggestions(res.data.slice(0, 6));
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        window.clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showDropdown && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSuggestionClick(suggestions[selectedIndex]);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) return;
    
    setShowDropdown(false);
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/catalog?q=${encodeURIComponent(trimmed)}`);
    }
    inputRef.current?.blur();
  };

  const handleSuggestionClick = (product: Product) => {
    setShowDropdown(false);
    setQuery(product.name);
    navigate(`/product/${product.id}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : 'w-full'} ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white border border-ash rounded-full px-4 h-10 w-full"
        role="search"
      >
        <span className="material-symbols-outlined text-smoke text-lg shrink-0">search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on suggestion to register
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || searchPlaceholder}
          className="flex-1 bg-transparent border-none outline-none font-sans text-body-sm text-charcoal placeholder:text-charcoal/50 min-w-0"
          aria-label="Search products"
        />
      </form>

      {/* Dropdown */}
      {showDropdown && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ash rounded shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="p-4 flex justify-center items-center">
              <span className="material-symbols-outlined animate-spin text-smoke">progress_activity</span>
            </div>
          ) : suggestions.length > 0 ? (
            <ul>
              {suggestions.map((product, index) => {
                const imagePath = product.main_image || product.images?.[0]?.image_path || '';
                return (
                  <li
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-cream-paper' : 'hover:bg-cream-paper'
                    }`}
                  >
                    <img
                      src={getImageUrl(imagePath)}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded bg-ash/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-charcoal truncate">
                        {product.name}
                      </p>
                      <p className="text-body-sm text-smoke">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-body-sm text-smoke">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
