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
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setLikesCount(product.likes_count);
      setLiked(false);
      setSelectedColor('');
      setSelectedModel('');
      setWarningMsg(null);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const p = product;
  const allImages = p.images && p.images.length > 0
    ? p.images.map((img) => getImageUrl(img.image_path))
    : (p.main_image ? [getImageUrl(p.main_image)] : []);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const currentDisplayImage = allImages[activeImageIndex] || allImages[0] || '';

  // Extract all unique colors and models
  const allColors = p.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (v.color_code && v.color !== 'Default' && v.color !== '' && !acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  const allModels = Array.from(
    new Set([
      ...(p.models ?? []),
      ...(p.variants?.map((v) => v.model).filter((m): m is string => Boolean(m && m.trim())) ?? []),
    ])
  );

  // Dynamic Filtering: Colors available for the currently selected Model
  const availableColorsForModel = selectedModel
    ? allColors.filter((c) =>
        p.variants?.some(
          (v) => (!v.model || v.model === selectedModel) && v.color_code === c.code
        )
      )
    : allColors;

  // Dynamic Filtering: Models available for the currently selected Color
  const availableModelsForColor = selectedColor
    ? allModels.filter((m) =>
        p.variants?.some((v) => v.color_code === selectedColor && (!v.model || v.model === m))
      )
    : allModels;

  function handleSelectModel(modelName: string) {
    setSelectedModel(modelName);
    if (selectedColor && modelName) {
      const isColorValid = p.variants?.some(
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
      const isModelValid = p.variants?.some(
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

  const colorName = allColors.find((c) => c.code === selectedColor)?.color ?? '';
  const orderMessage = `Hi Upanishad Mobile Store, I would like to reserve/order:
- Product: ${p.name}
- Price: ₹${p.price}
${selectedModel ? `- Model: ${selectedModel}\n` : ''}${colorName ? `- Color: ${colorName}\n` : ''}- Order Type: Store Pickup`;

  const num = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(orderMessage)}`;

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
          {currentDisplayImage ? (
            <img
              src={currentDisplayImage}
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

        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-6 pt-3 no-scrollbar">
            {allImages.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-14 rounded border overflow-hidden p-1 transition-all shrink-0 bg-white ${
                  activeImageIndex === idx ? 'border-[#004ac6] ring-2 ring-[#004ac6]/30' : 'border-ash hover:border-smoke'
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
              </button>
            ))}
          </div>
        )}

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

          <div className="flex items-center gap-4 text-caption text-smoke">
            {p.category && (
              <span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider">Category: </span>
                {p.category}
              </span>
            )}
          </div>

          {/* Store Pickup Only Actions */}
          <div className="bg-[#fcf8f2] border border-[#f5c6cb] rounded p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#856404] text-xl">store</span>
              <div>
                <p className="font-sans text-body-sm font-semibold text-[#856404]">Store Pickup Only</p>
                <p className="font-sans text-caption text-[#856404] mt-0.5">
                  Connect directly via WhatsApp or Call to confirm product availability and details!
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-sans text-label-sm uppercase tracking-wider px-4 py-3 rounded hover:bg-[#20bd5a] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                Order on WhatsApp
              </a>
              <a
                href="tel:+919666731286"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#007AFF] text-white font-sans text-label-sm uppercase tracking-wider px-4 py-3 rounded hover:bg-[#0056b3] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                Call Store Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
