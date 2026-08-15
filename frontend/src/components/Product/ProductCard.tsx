import { useNavigate } from 'react-router-dom';
import type { Product, ProductVariant } from '../../types';
import { getImageUrl, formatLikes } from '../../utils/api';

interface ProductCardProps {
  product: Product;
  onLike: (id: number) => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
}

export default function ProductCard({ product, onLike, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();

  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].image_path) : (product.main_image ? getImageUrl(product.main_image) : '');

  const colorVariants = product.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (v.color_code && !acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  function handleOpen() {
    navigate(`/product/${product.id}`);
  }

  const availableModels = Array.from(
    new Set([
      ...(product.models ?? []),
      ...(product.variants?.map((v) => v.model).filter((m): m is string => Boolean(m && m.trim())) ?? []),
    ])
  );

  return (
    <div
      className="group relative bg-white border border-ash rounded-xl overflow-hidden hover:border-ink-black hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={handleOpen}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      aria-label={`View ${product.name}`}
    >
      {/* Card Header Badges */}
      <div className="aspect-square relative overflow-hidden bg-[#fbf8f6] p-4 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-smoke">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}

        {/* Badges Container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.is_out_of_stock ? (
            <span className="bg-red-600 text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Out of Stock
            </span>
          ) : (
            <>
              {product.is_new_arrival && (
                <span className="bg-butter-highlight text-ink-black font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-ash/40 shadow-sm">
                  NEW
                </span>
              )}
              {product.is_offer && (
                <span className="bg-ink-black text-white font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                  OFFER
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-ink-black font-sans text-label-sm uppercase tracking-widest px-3 py-1.5 rounded shadow-md border border-ash transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between bg-white">
        <div>
          <h3 className="font-sans text-body-sm font-semibold text-ink-black line-clamp-1 group-hover:text-[#004ac6] transition-colors mb-1.5">
            {product.name}
          </h3>

          {/* Color Swatches Showcase */}
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold text-smoke uppercase tracking-wider">Colors:</span>
              <div className="flex items-center gap-1">
                {colorVariants.slice(0, 5).map((c, i) => (
                  <span
                    key={i}
                    className="w-3.5 h-3.5 rounded-full border border-ash inline-block shadow-2xs transition-transform hover:scale-125"
                    style={{ backgroundColor: c.code || '#333' }}
                    title={c.color}
                  />
                ))}
                {colorVariants.length > 5 && (
                  <span className="text-[10px] text-smoke font-bold">+{colorVariants.length - 5}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-ash/40 flex flex-wrap items-center justify-between gap-2">
          <p className="font-sans text-body-md font-bold text-ink-black">₹{product.price.toLocaleString('en-IN')}</p>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(product.id);
              }}
              className="flex items-center gap-1 text-smoke hover:text-red-500 transition-colors p-1"
              aria-label={`Like ${product.name}`}
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              <span className="font-sans text-caption font-semibold">{formatLikes(product.likes_count)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
