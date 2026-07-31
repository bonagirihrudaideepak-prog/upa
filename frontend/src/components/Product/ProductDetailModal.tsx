import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../../types';
import { getImageUrl, api, formatLikes } from '../../utils/api';
import { useApp } from '../../context/AppContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, variant?: ProductVariant) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { whatsappNumber, instagramUrl: ctxInstagramUrl } = useApp();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [showPickupNotice, setShowPickupNotice] = useState(false);

  useEffect(() => {
    if (product) {
      setLikesCount(product.likes_count);
      setLiked(false);
      setSelectedColor('');
      setSelectedModel('');
      setShowPickupNotice(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const p = product;
  const imageUrl = p.images?.[0] ? getImageUrl(p.images[0].image_path) : (p.main_image ? getImageUrl(p.main_image) : '');

  const uniqueColors = p.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (!acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  const uniqueModels = [...new Set(p.variants?.map((v) => v.model) ?? [])];

  async function handleLike() {
    if (liking) return;
    setLiking(true);
    const res = await api.likeProduct(p.id);
    if (res.success) {
      setLikesCount((prev) => prev + 1);
      setLiked(true);
    }
    setLiking(false);
  }

  const colorName = uniqueColors.find((c) => c.code === selectedColor)?.color ?? '';
  const orderMessage = `Hi Upanishad Mobile Store, I would like to reserve/order:
- Product: ${p.name}
- Price: ₹${p.price}
${selectedModel ? `- Model: ${selectedModel}\n` : ''}${colorName ? `- Color: ${colorName}\n` : ''}- Order Type: Store Pickup / Takeaway`;

  const num = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(orderMessage)}`;
  const instagramUrl = ctxInstagramUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      style={{ backgroundColor: 'rgba(251, 248, 246, 0.95)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <style>{'@keyframes fadeIn{from{opacity:0}to{opacity:1}}'}</style>
      <div
        className="relative w-full max-w-2xl mx-auto my-8 bg-white border border-ash rounded overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border border-ash rounded hover:bg-cream-paper transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="aspect-[4/3] relative overflow-hidden bg-cream-paper">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-smoke">
              <span className="material-symbols-outlined text-6xl">image</span>
            </div>
          )}
          {p.is_out_of_stock && (
            <div className="absolute top-4 left-4 bg-red-600 text-white font-sans text-caption font-bold px-3 py-1 rounded uppercase tracking-wider">
              Out of Stock
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-headline-md text-headline-md text-ink-black">{p.name}</h2>
              <p className="font-body-lg text-body-lg text-ink-black font-bold mt-1">₹{p.price}</p>
            </div>
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1 transition-colors shrink-0 ${
                liked ? 'text-red-500' : 'text-smoke hover:text-red-500'
              }`}
              aria-label="Like this product"
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

          {p.description && (
            <p className="font-body-md text-body-md text-smoke leading-relaxed">{p.description}</p>
          )}

          {uniqueColors.length > 0 && (
            <div>
              <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">
                Color {colorName ? `: ${colorName}` : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {uniqueColors.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedColor(c.code === selectedColor ? '' : c.code)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === c.code ? 'border-ink-black scale-110' : 'border-ash hover:border-smoke'
                    }`}
                    style={{ backgroundColor: c.code }}
                    aria-label={c.color}
                    title={c.color}
                  />
                ))}
              </div>
            </div>
          )}

          {uniqueModels.length > 0 && (
            <div>
              <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">Model</p>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border border-ash rounded px-3 py-2 font-body-md text-body-md text-ink-black bg-white focus:outline-none focus:border-ink-black transition-colors"
              >
                <option value="">Select model (e.g. iPhone 17, 16, 15...)</option>
                {uniqueModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-4 text-caption text-smoke">
            {p.sku && (
              <span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">SKU: </span>
                {p.sku}
              </span>
            )}
            {p.category && (
              <span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Category: </span>
                {p.category}
              </span>
            )}
          </div>

          {/* Store Pickup / Takeaway Notice & Order Actions */}
          {showPickupNotice ? (
            <div className="bg-[#fcf8f2] border border-[#f5c6cb] rounded p-4 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#856404] text-xl">store</span>
                <div>
                  <p className="font-sans text-body-sm font-semibold text-[#856404]">Store Pickup & Takeaway Only</p>
                  <p className="font-sans text-caption text-[#856404] mt-0.5">
                    Our store currently accepts in-store pickups & takeaways (no delivery option yet). Connect via WhatsApp or Instagram to confirm your order details!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-label-sm uppercase tracking-wider px-4 py-2.5 rounded hover:bg-[#20bd5a] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Order on WhatsApp
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E1306C] text-white font-sans text-label-sm uppercase tracking-wider px-4 py-2.5 rounded hover:bg-[#c1275b] transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                  Order on Instagram
                </a>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowPickupNotice(true)}
              disabled={p.is_out_of_stock}
              className="w-full bg-ink-black text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:bg-smoke disabled:bg-ash disabled:cursor-not-allowed transition-colors tracking-wider flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
              {p.is_out_of_stock ? 'Out of Stock' : 'Add to Cart / Order Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
