import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Navbar from '../components/Layout/Navbar';
import ScrollingDeals from '../components/Social/ScrollingDeals';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import ProductGrid from '../components/Product/ProductGrid';
import { useApp } from '../context/AppContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { api } from '../utils/api';
import type { Product, Category, ProductVariant } from '../types';

const PAGE_TITLES: Record<string, string> = {
  iphone: 'iPhone',
  samsung: 'Samsung',
  accessories: 'Accessories',
  gadgets: 'Gadgets',
  others: 'Others',
};

export default function CatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const { showToast, whatsappNumber } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');

  const pageTitle = slug
    ? PAGE_TITLES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1)
    : query
      ? `Search: "${query}"`
      : 'All Products';

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data);
      setCategoriesLoading(false);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    let res;
    if (slug) {
      res = await api.getProductsByCategory(slug);
    } else if (query) {
      res = await api.searchProducts(query);
    } else {
      res = await api.getProducts();
    }
    if (res.success && res.data) {
      setProducts(res.data);
    } else if (res.error) {
      showToast(res.error, 'error');
    }
  }, [slug, query, showToast]);

  useEffect(() => {
    setLoading(true);
    void fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  // Live refresh: newly added products show up automatically
  useAutoRefresh(() => {
    setLoading(false);
    return fetchProducts();
  }, 20000);

  function handleAddToCart(product: Product, _variant?: ProductVariant) {
    const num = whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Hi, I'm interested in buying ${product.name} - ₹${product.price}. Please confirm pickup availability.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  }

  async function handleLike(productId: number) {
    const res = await api.likeProduct(productId);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes_count: p.likes_count + 1 } : p))
      );
    }
  }

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'popular': sorted.sort((a, b) => b.likes_count - a.likes_count); break;
      default: break; // 'newest' is default from API
    }
    return sorted;
  }, [products, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-24 md:pt-28 pb-12">
        <div className="max-w-container mx-auto px-gutter">
          {/* Page Title & Filters */}
          <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-headline-md text-headline-md text-ink-black">
                {pageTitle}
              </h1>
              {!loading && (
                <p className="font-body-md text-body-md text-smoke mt-1">
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </p>
              )}
            </div>

            {/* Filters */}
            {!loading && products.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <span className="font-sans text-label-sm uppercase tracking-widest text-smoke whitespace-nowrap hidden md:inline-block mr-2">
                  Sort By:
                </span>
                <button
                  onClick={() => setSortBy('newest')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-body-sm transition-colors ${
                    sortBy === 'newest'
                      ? 'bg-ink-black text-white'
                      : 'bg-white border border-ash text-ink-black hover:border-ink-black'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('price-asc')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-body-sm transition-colors ${
                    sortBy === 'price-asc'
                      ? 'bg-ink-black text-white'
                      : 'bg-white border border-ash text-ink-black hover:border-ink-black'
                  }`}
                >
                  Price: Low to High
                </button>
                <button
                  onClick={() => setSortBy('price-desc')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-body-sm transition-colors ${
                    sortBy === 'price-desc'
                      ? 'bg-ink-black text-white'
                      : 'bg-white border border-ash text-ink-black hover:border-ink-black'
                  }`}
                >
                  Price: High to Low
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-body-sm transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-ink-black text-white'
                      : 'bg-white border border-ash text-ink-black hover:border-ink-black'
                  }`}
                >
                  Most Liked
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={sortedProducts}
            loading={loading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>

      <WhatsAppButton />
      <CallButton />
      <Footer />
    </div>
  );
}
