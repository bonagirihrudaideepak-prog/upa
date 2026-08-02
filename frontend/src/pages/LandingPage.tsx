import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ScrollingDeals from '../components/Social/ScrollingDeals';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import InstagramButton from '../components/Social/InstagramButton';
import ProductGrid from '../components/Product/ProductGrid';
import ProductDetailModal from '../components/Product/ProductDetailModal';
import HeroBannerCarousel from '../components/Banner/HeroBannerCarousel';
import { useApp } from '../context/AppContext';
import { api } from '../utils/api';
import type { Product, Offer, Category, ProductVariant } from '../types';

const FEATURED_CATEGORIES = [
  { name: 'iPhone', slug: 'iphone', icon: 'phone_iphone', color: '#007AFF' },
  { name: 'Samsung', slug: 'samsung', icon: 'smartphone', color: '#1428A0' },
  { name: 'Accessories', slug: 'accessories', icon: 'headphones', color: '#FF6B35' },
  { name: 'Gadgets', slug: 'gadgets', icon: 'watch', color: '#34C759' },
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

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-24 md:pt-28 pb-12">
        {/* Hero Section */}
        <HeroBannerCarousel offers={offers} loading={offersLoading} />

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
                className="flex flex-col items-center gap-3 p-5 bg-white border border-ash rounded-xl hover:border-ink-black hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: cat.color }}
                >
                  <span className="material-symbols-outlined text-2xl text-white">
                    {cat.icon}
                  </span>
                </div>
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
