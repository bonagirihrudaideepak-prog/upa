import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import { useApp } from '../context/AppContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
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
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    const res = await api.getProduct(id);
    if (!isMountedRef.current) return;
    if (res.success && res.data) {
      setProduct(res.data);
      setLikesCount(res.data.likes_count);
    } else {
      setError(res.error ?? 'Product not found');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      await fetchProduct();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, [id, fetchProduct]);

  // Auto-refresh stock/price updates without reloading the page
  useAutoRefresh(fetchProduct, 20000);

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

  const allImages = product.images && product.images.length > 0
    ? product.images.map((img) => getImageUrl(img.image_path))
    : (product.main_image ? [getImageUrl(product.main_image)] : []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentDisplayImage = allImages[activeImageIndex] || allImages[0] || '';

  // Extract all unique colors and models
  const allColors = product.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (v.color_code && !acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color || 'Default', code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  const allModels = Array.from(
    new Set([
      ...(product.models ?? []),
      ...(product.variants?.map((v) => v.model).filter((m): m is string => Boolean(m && m.trim())) ?? []),
    ])
  );

  // Dynamic Filtering: Colors available for the currently selected Model
  const availableColorsForModel = selectedModel
    ? allColors.filter((c) =>
        product.variants?.some(
          (v) => (!v.model || v.model === selectedModel) && v.color_code === c.code
        )
      )
    : allColors;

  // Dynamic Filtering: Models available for the currently selected Color
  const availableModelsForColor = selectedColor
    ? allModels.filter((m) =>
        product.variants?.some((v) => v.color_code === selectedColor && (!v.model || v.model === m))
      )
    : allModels;

  function handleSelectModel(modelName: string) {
    setSelectedModel(modelName);
    if (selectedColor && modelName) {
      const isColorValid = product?.variants?.some(
        (v) => (!v.model || v.model === modelName) && v.color_code === selectedColor
      );
      if (!isColorValid) {
        const colorObj = allColors.find((c) => c.code === selectedColor);
        const colorNameStr = colorObj?.color || 'Selected Color';
        setSelectedColor('');
        setWarningMsg(`⚠️ ${colorNameStr} is not available for the selected ${modelName}. Please choose another color.`);
        return;
      }
    }
    setWarningMsg(null);
  }

  function handleSelectColor(colorCode: string) {
    if (selectedColor === colorCode) {
      setSelectedColor('');
      setWarningMsg(null);
      return;
    }

    setSelectedColor(colorCode);
    if (selectedModel && colorCode) {
      const isModelValid = product?.variants?.some(
        (v) => (!v.model || v.model === selectedModel) && v.color_code === colorCode
      );
      if (!isModelValid) {
        const colorObj = allColors.find((c) => c.code === colorCode);
        const colorNameStr = colorObj?.color || 'Selected Color';
        setWarningMsg(`⚠️ ${colorNameStr} is not available for the selected ${selectedModel}. Please choose another color.`);
        return;
      }
    }
    setWarningMsg(null);
  }

  const colorName = allColors.find((c) => c.code === selectedColor)?.color ?? '';

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].image_path) : (product.main_image ? getImageUrl(product.main_image) : '');

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
            {/* Product Image Gallery */}
            <div className="aspect-[4/3] relative overflow-hidden bg-cream-paper border border-ash rounded mb-3">
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-smoke">
                  <span className="material-symbols-outlined text-6xl">image</span>
                </div>
              )}
            </div>

            {/* Additional Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto mb-6 pb-1 no-scrollbar">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded border overflow-hidden p-1 transition-all shrink-0 bg-white ${
                      activeImageIndex === idx ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30' : 'border-ash hover:border-smoke'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

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

              {/* Model Selector */}
              {allModels.length > 0 && (
                <div>
                  <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">
                    1. Select Phone Model
                  </p>
                  <select
                    value={selectedModel}
                    onChange={(e) => handleSelectModel(e.target.value)}
                    className="w-full border border-ash rounded px-3.5 py-2.5 font-body-md text-body-md text-ink-black bg-white focus:outline-none focus:border-ink-black transition-colors"
                  >
                    <option value="">-- Select Model --</option>
                    {allModels.map((m) => {
                      const isAvailableForColor = availableModelsForColor.includes(m);
                      return (
                        <option key={m} value={m} disabled={selectedColor ? !isAvailableForColor : false}>
                          {m} {selectedColor && !isAvailableForColor ? '(Not available in selected color)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Color Swatches */}
              {allColors.length > 0 && (
                <div>
                  <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">
                    2. Select Color {colorName ? `: ${colorName}` : ''}
                  </p>
                  {availableColorsForModel.length === 0 && selectedModel ? (
                    <p className="font-sans text-body-sm text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                      No color variants available for this model.
                    </p>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {allColors.map((c) => {
                        const isAvailable = availableColorsForModel.some((ac) => ac.code === c.code);
                        const isSelected = selectedColor === c.code;

                        return (
                          <button
                            key={c.code}
                            onClick={() => handleSelectColor(c.code)}
                            className={`w-9 h-9 rounded-full border-2 transition-all relative ${
                              isSelected
                                ? 'border-ink-black scale-110 shadow-md ring-2 ring-ink-black/20'
                                : isAvailable
                                ? 'border-ash hover:border-smoke'
                                : 'border-gray-200 opacity-35 cursor-not-allowed'
                            }`}
                            style={{ backgroundColor: c.code }}
                            aria-label={c.color}
                            title={isAvailable ? c.color : `${c.color} (Not available for ${selectedModel || 'this model'})`}
                          >
                            {!isAvailable && (
                              <span className="absolute inset-0 flex items-center justify-center text-red-500 font-bold text-xs select-none">
                                ✕
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Warning Banner */}
              {warningMsg && (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-2.5 text-amber-900 animate-fadeIn">
                  <span className="material-symbols-outlined text-lg text-amber-600 shrink-0 mt-0.5">warning</span>
                  <p className="font-sans text-body-sm font-semibold leading-snug">{warningMsg}</p>
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
