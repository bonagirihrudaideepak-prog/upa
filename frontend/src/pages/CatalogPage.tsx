import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import Navbar from '../components/Layout/Navbar';
import ScrollingDeals from '../components/Social/ScrollingDeals';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import InstagramButton from '../components/Social/InstagramButton';
import ProductGrid from '../components/Product/ProductGrid';
import ProductDetailModal from '../components/Product/ProductDetailModal';
import { useApp } from '../context/AppContext';
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function fetchProducts() {
      let res;
      if (slug) {
        res = await api.getProductsByCategory(slug);
      } else if (query) {
        res = await api.searchProducts(query);
      } else {
        res = await api.getProducts();
      }
      if (cancelled) return;
      if (res.success && res.data) {
        setProducts(res.data);
      } else {
        setProducts([]);
        if (res.error) showToast(res.error, 'error');
      }
      setLoading(false);
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, [slug, query, showToast]);

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

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />
      <Navbar categories={categories} loading={categoriesLoading} />

      <main className="flex-1 w-full pt-28 md:pt-32 pb-12">
        <div className="max-w-container mx-auto px-gutter">
          {/* Page Title */}
          <div className="py-6">
            <h1 className="font-headline-md text-headline-md text-ink-black">
              {pageTitle}
            </h1>
            {!loading && (
              <p className="font-body-md text-body-md text-smoke mt-1">
                {products.length} {products.length === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={products}
            loading={loading}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
            onProductClick={setSelectedProduct}
          />
        </div>
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
