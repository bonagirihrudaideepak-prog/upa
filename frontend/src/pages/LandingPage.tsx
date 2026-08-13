import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import ProductGrid from '../components/Product/ProductGrid';
import HeroBannerCarousel from '../components/Banner/HeroBannerCarousel';
import { useApp } from '../context/AppContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { api, getImageUrl } from '../utils/api';
import type { Product, Offer, Category, ProductVariant } from '../types';

const FEATURED_CATEGORY_FALLBACKS: Record<string, { icon: string; color: string }> = {
  electronics: { icon: 'devices', color: '#5856D6' },
  iphone: { icon: 'phone_iphone', color: '#007AFF' },
  samsung: { icon: 'smartphone', color: '#1428A0' },
  accessories: { icon: 'headphones', color: '#FF6B35' },
  gadgets: { icon: 'watch', color: '#34C759' },
  others: { icon: 'devices_other', color: '#8E8E93' },
};

export default function LandingPage() {
  const { showToast, whatsappNumber } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allProductsLoading, setAllProductsLoading] = useState(true);

  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const load = useCallback(async () => {
    const [offersRes, featuredRes, newArrivalsRes, categoriesRes, allProductsRes] = await Promise.all([
      api.getOffers(),
      api.getFeatured(),
      api.getNewArrivals(),
      api.getCategories(),
      api.getProducts(),
    ]);
    if (offersRes.success && offersRes.data) setOffers(offersRes.data);
    else showToast('Failed to load offers', 'error');
    setOffersLoading(false);

    if (featuredRes.success && featuredRes.data) setFeatured(featuredRes.data);
    else showToast('Failed to load featured products', 'error');
    setFeaturedLoading(false);

    if (newArrivalsRes.success && newArrivalsRes.data) setNewArrivals(newArrivalsRes.data);
    else showToast('Failed to load new arrivals', 'error');
    setNewArrivalsLoading(false);

    if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);

    if (allProductsRes.success && allProductsRes.data) setAllProducts(allProductsRes.data);
    else showToast('Failed to load all products', 'error');
    setAllProductsLoading(false);
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [load]);

  // Live refresh: pick up newly added products/offers automatically
  useAutoRefresh(load, 20000);

  function handleAddToCart(product: Product, _variant?: ProductVariant) {
    const num = whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Hi, I'm interested in buying ${product.name} - ₹${product.price}. Please confirm pickup availability.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  }

  async function handleLike(productId: number) {
    const res = await api.likeProduct(productId);
    if (res.success) {
      setFeatured((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes_count: p.likes_count + 1 } : p))
      );
      setNewArrivals((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes_count: p.likes_count + 1 } : p))
      );
      setAllProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes_count: p.likes_count + 1 } : p))
      );
    }
  }

  // Display limits: 8 items on both mobile and desktop
  const displayLimit = 8;

  // New Arrivals showing strictly top 8 max (or 4 on mobile)
  const newArrivalsList = useMemo(() => {
    return newArrivals.slice(0, displayLimit);
  }, [newArrivals, displayLimit]);

  function getProductsByCategory(categoryName: string): Product[] {
    return allProducts.filter(p => 
      String(p.category || '').toLowerCase() === categoryName.toLowerCase()
    ).slice(0, displayLimit);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-24 md:pt-28 pb-12">
        {/* Hero Section */}
        <HeroBannerCarousel offers={offers} loading={offersLoading} />

        {/* Featured Categories */}
        <section className="max-w-container mx-auto px-gutter mb-10 mt-8">
          <h2 className="font-headline-md text-headline-md text-ink-black mb-5 butter-underline inline-block">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
            {categories.map((cat) => {
              const fallback = FEATURED_CATEGORY_FALLBACKS[cat.slug] || { icon: 'category', color: '#AF52DE' };
              const imgUrl = cat.image_path ? getImageUrl(cat.image_path) : '';
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-16 h-16 md:w-20 md:h-20 aspect-square rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-md overflow-hidden"
                    style={imgUrl ? undefined : { backgroundColor: fallback.color }}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-2xl md:text-3xl text-white">
                        {fallback.icon}
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-[11px] md:text-label-md text-ink-black text-center font-medium">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Recommended */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <h2 className="font-headline-md text-headline-md text-ink-black mb-5 butter-underline inline-block">
            Top Recommended
          </h2>
          <ProductGrid
            products={featured.slice(0, displayLimit)}
            loading={featuredLoading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* New Arrivals */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-md text-headline-md text-ink-black butter-underline inline-block">
              New Arrivals
            </h2>
            <Link
              to="/catalog?filter=new-arrivals"
              className="font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors"
            >
              View all
            </Link>
          </div>
          <ProductGrid
            products={newArrivalsList}
            loading={newArrivalsLoading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* Individual Category Sections — dynamically driven by the categories in the DB */}
        {categories.map((cat) => {
          const catProducts = getProductsByCategory(cat.name);
          if (catProducts.length === 0 && !allProductsLoading) return null;
          return (
            <section key={cat.id} className="max-w-container mx-auto px-gutter mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline-md text-headline-md text-ink-black butter-underline inline-block">
                  {cat.name}
                </h2>
                <Link
                  to={`/category/${cat.slug}`}
                  className="font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors"
                >
                  View all
                </Link>
              </div>
              <ProductGrid
                products={catProducts}
                loading={allProductsLoading}
                onLike={handleLike}
                onAddToCart={handleAddToCart}
              />
            </section>
          );
        })}

        {/* All Products */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-md text-headline-md text-ink-black butter-underline inline-block">
              All Products
            </h2>
            <Link
              to="/catalog"
              className="font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors"
            >
              View all
            </Link>
          </div>
          <ProductGrid
            products={allProducts.slice(0, displayLimit * 2)}
            loading={allProductsLoading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
          />
        </section>
      </main>

      <WhatsAppButton />
      <CallButton />
      <Footer />
    </div>
  );
}
