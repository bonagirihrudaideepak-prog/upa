import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../../types';
import { getImageUrl, api } from '../../utils/api';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
}

function formatLikes(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count.toString();
}

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (product) {
      setLikesCount(product.likes_count);
      setLiked(false);
      setSelectedColor('');
      setSelectedModel('');
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const p = product;
  const imageUrl = p.images?.[0] ? getImageUrl(p.images[0].image_path) : '';

  const uniqueColors = p.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (!acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  const uniqueModels = [...new Set(p.variants?.map((v) => v.model) ?? [])];

  function getSelectedVariant(): ProductVariant | undefined {
    return p.variants?.find((v) => {
      const colorMatch = !selectedColor || v.color_code === selectedColor;
      const modelMatch = !selectedModel || v.model === selectedModel;
      return colorMatch && modelMatch;
    });
  }

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

  function handleAddToCart() {
    const variant = getSelectedVariant();
    onAddToCart(p, variant);
  }

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
        className="relative w-full max-w-2xl mx-auto my-8 bg-white border border-ash rounded overflow-hidden"
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
              <p className="font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-2">Color</p>
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
                <option value="">Select model</option>
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

          <button
            onClick={handleAddToCart}
            className="w-full bg-ink-black text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:bg-smoke transition-colors tracking-wider"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
