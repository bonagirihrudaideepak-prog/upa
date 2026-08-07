import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import { useApp } from '../context/AppContext';
import { api, getImageUrl, formatLikes } from '../utils/api';
import type { Product, ProductVariant } from '../types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contactPhone, whatsappNumber } = useApp();

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/catalog');
    }
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.getProduct(id).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setProduct(res.data);
        setLikesCount(res.data.likes_count);
      } else {
        setError(res.error ?? 'Product not found');
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (product) {
      setSelectedColor('');
      setSelectedModel('');
      setLiked(false);
    }
  }, [product]);

  async function handleLike() {
    if (!product || liking) return;
    setLiking(true);
    const res = await api.likeProduct(product.id);
    if (res.success) {
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    }
    setLiking(false);
  }

  function handleAddToCart() {
    if (!product || addingToCart) return;
    setAddingToCart(true);
    const variant = getSelectedVariant();
    const variantLabel = variant
      ? ` (${variant.color}, ${variant.model})`
      : '';
    const num = whatsappNumber.replace(/[^0-9]/g, '');
    const message = `Hi, I'm interested in buying ${product.name}${variantLabel} - ₹${product.price}. Please confirm pickup availability.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    setTimeout(() => setAddingToCart(false), 1000);
  }

  function getSelectedVariant(): ProductVariant | undefined {
    return product?.variants?.find((v) => {
      const colorMatch = !selectedColor || v.color_code === selectedColor;
      const modelMatch = !selectedModel || v.model === selectedModel;
      return colorMatch && modelMatch;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-paper">
        <Header />
        <main className="flex-1 w-full pt-20 md:pt-24 pb-12">
          <div className="max-w-container mx-auto px-gutter">
            <div className="max-w-2xl mx-auto animate-pulse">
              <div className="aspect-[4/3] bg-cream-paper border border-ash rounded mb-6" />
              <div className="h-6 bg-ash rounded w-3/4 mb-3" />
              <div className="h-8 bg-ash rounded w-1/3 mb-6" />
              <div className="h-4 bg-ash rounded w-full mb-2" />
              <div className="h-4 bg-ash rounded w-5/6 mb-8" />
              <div className="h-10 bg-ash rounded w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-paper">
        <Header />
        <main className="flex-1 w-full pt-20 md:pt-24 pb-12 flex items-center justify-center">
          <div className="text-center px-gutter">
            <span className="material-symbols-outlined text-6xl text-smoke mb-4 block">search_off</span>
            <h1 className="font-headline-md text-headline-md text-ink-black mb-2">
              {error === 'Product not found' ? 'Product Not Found' : 'Something went wrong'}
            </h1>
            <p className="font-body-md text-body-md text-smoke mb-6">
              {error || 'Could not load product details. Please try again.'}
            </p>
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Go back
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].image_path) : '';
  const uniqueColors = product.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (!acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];
  const uniqueModels = [...new Set(product.variants?.map((v) => v.model) ?? [])];

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-28 md:pt-32 pb-12">
        <div className="max-w-container mx-auto px-gutter">
          {/* Back Button */}
          <button
            onClick={goBack}
            className="flex items-center gap-1 font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors mb-6"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>

          <div className="max-w-2xl mx-auto">
            {/* Product Image */}
            <div className="aspect-[4/3] relative overflow-hidden bg-cream-paper border border-ash rounded mb-6">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-smoke">
                  <span className="material-symbols-outlined text-6xl">image</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="font-headline-md text-headline-md text-ink-black">{product.name}</h1>
                  <p className="font-headline-sm text-headline-sm text-ink-black font-bold mt-1">
                    ₹{product.price}
                  </p>
                </div>

                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1 transition-colors shrink-0 ${
                    liked ? 'text-red-500' : 'text-smoke hover:text-red-500'
                  }`}
                  aria-label={liked ? 'Liked' : 'Like this product'}
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {liking ? 'sync' : 'favorite'}
                  </span>
                  <span className="font-label-sm text-label-sm">{formatLikes(likesCount)}</span>
                </button>
              </div>

              {product.description && (
                <p className="font-body-md text-body-md text-smoke leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Color Swatches */}
              {uniqueColors.length > 0 && (
                <div>
                  <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">
                    Color
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {uniqueColors.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => setSelectedColor(c.code === selectedColor ? '' : c.code)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === c.code
                            ? 'border-ink-black scale-110'
                            : 'border-ash hover:border-smoke'
                        }`}
                        style={{ backgroundColor: c.code }}
                        aria-label={c.color}
                        title={c.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Model Selector */}
              {uniqueModels.length > 0 && (
                <div>
                  <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">
                    Model
                  </p>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full border border-ash rounded px-3 py-2 font-body-md text-body-md text-ink-black bg-white focus:outline-none focus:border-ink-black transition-colors"
                  >
                    <option value="">Select model</option>
                    {uniqueModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* SKU / Category */}
              <div className="flex items-center gap-4 text-caption text-smoke">
                {product.sku && (
                  <span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider">SKU: </span>
                    {product.sku}
                  </span>
                )}
                {product.is_out_of_stock && (
                  <span className="text-red-500 font-label-sm text-label-sm uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Pickup Notice */}
              <div className="flex items-start gap-3 p-4 bg-butter-highlight/30 border border-butter-highlight rounded">
                <span className="material-symbols-outlined text-lg text-smoke shrink-0 mt-0.5">info</span>
                <p className="font-body-md text-body-md text-smoke">
                  Store only accepts pickups/takeaways. Message us on WhatsApp or call to inquire about availability.
                </p>
              </div>

              {/* Contact Strip */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#007AFF] text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:opacity-90 transition-opacity tracking-wider"
                >
                  <span className="material-symbols-outlined text-lg">call</span>
                  Call to Inquire
                </a>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.is_out_of_stock}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:opacity-90 transition-opacity tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  {addingToCart ? 'Opening WhatsApp...' : 'WhatsApp Us'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppButton />
      <CallButton />
      <Footer />
    </div>
  );
}
