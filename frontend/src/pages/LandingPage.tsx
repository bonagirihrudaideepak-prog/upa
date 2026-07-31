import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ScrollingDeals from '../components/Social/ScrollingDeals';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import InstagramButton from '../components/Social/InstagramButton';
import ProductGrid from '../components/Product/ProductGrid';
import ProductDetailModal from '../components/Product/ProductDetailModal';
import { useApp } from '../context/AppContext';
import { api, getImageUrl } from '../utils/api';
import type { Product, Offer, Category, ProductVariant } from '../types';

const FEATURED_CATEGORIES = [
  { name: 'iPhone', slug: 'iphone', icon: 'smartphone' },
  { name: 'Samsung', slug: 'samsung', icon: 'devices' },
  { name: 'Accessories', slug: 'accessories', icon: 'cable' },
  { name: 'Gadgets', slug: 'gadgets', icon: 'stadia_controller' },
];

export default function LandingPage() {
  const { showToast, whatsappNumber } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [offersRes, featuredRes, newArrivalsRes, categoriesRes] = await Promise.all([
        api.getOffers(),
        api.getFeatured(),
        api.getNewArrivals(),
        api.getCategories(),
      ]);
      if (cancelled) return;
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
    }
    load();
    return () => { cancelled = true; };
  }, [showToast]);

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
    }
  }

  const firstOffer = offers.find((o) => o.is_active) ?? offers[0];
  const heroImage = firstOffer ? getImageUrl(firstOffer.image_path) : '';

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-24 md:pt-28 pb-12">
        {/* Hero Section */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden relative bg-cream-paper border border-ash">
            {offersLoading ? (
              <div className="w-full h-full animate-pulse bg-cream-paper" />
            ) : heroImage ? (
              <img
                src={heroImage}
                alt={firstOffer?.title ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-smoke">
                <span className="material-symbols-outlined text-6xl">celebration</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="font-headline-lg md:font-display text-white butter-underline">
                Modern Tech, Curated for You
              </h1>
              {firstOffer?.description && (
                <p className="font-body-md text-body-md text-white/80 mt-2 max-w-xl">
                  {firstOffer.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <h2 className="font-headline-md text-headline-md text-ink-black mb-5 butter-underline">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-3 p-6 bg-white border border-ash rounded hover:border-ink-black transition-colors group"
              >
                <span className="material-symbols-outlined text-3xl text-smoke group-hover:text-ink-black transition-colors">
                  {cat.icon}
                </span>
                <span className="font-label-md text-label-md text-ink-black">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Recommended */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <h2 className="font-headline-md text-headline-md text-ink-black mb-5 butter-underline">
            Top Recommended
          </h2>
          <ProductGrid
            products={featured.slice(0, 8)}
            loading={featuredLoading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
          />
        </section>

        {/* New Arrivals */}
        <section className="max-w-container mx-auto px-gutter mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-md text-headline-md text-ink-black butter-underline">
              New Arrivals
            </h2>
            <Link
              to="/catalog"
              className="font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors"
            >
              View all
            </Link>
          </div>
          <ProductGrid
            products={newArrivals.slice(0, 4)}
            loading={newArrivalsLoading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
          />
        </section>
      </main>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <WhatsAppButton />
      <InstagramButton />
      <Footer />
    </div>
  );
}
