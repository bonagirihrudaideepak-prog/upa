import type { Product, ProductVariant } from '../../types';
import { getImageUrl, formatLikes } from '../../utils/api';

interface ProductCardProps {
  product: Product;
  onLike: (id: number) => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onLike, onAddToCart }: ProductCardProps) {
  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].image_path) : (product.main_image ? getImageUrl(product.main_image) : '');

  const colorVariants = product.variants?.reduce<{ color: string; code: string }[]>((acc, v) => {
    if (v.color_code && !acc.find((c) => c.code === v.color_code)) {
      acc.push({ color: v.color, code: v.color_code });
    }
    return acc;
  }, []) ?? [];

  return (
    <div
      className="group relative bg-white border border-ash rounded-xl overflow-hidden hover:border-ink-black hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={() => onClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(product);
        }
      }}
      aria-label={product.name}
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

        {/* WhatsApp Quick Contact */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const msg = `Hi, I'm interested in ${product.name} - ₹${product.price.toLocaleString('en-IN')}. Is it available?`;
            window.open(`https://wa.me/919666731286?text=${encodeURIComponent(msg)}`, '_blank');
          }}
          className="absolute bottom-2.5 right-2.5 z-10 w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md"
          aria-label="Contact on WhatsApp"
          title="Ask about this product on WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-2 flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-sans text-[11px] uppercase tracking-wider text-smoke font-medium">{product.category}</span>
            {colorVariants.length > 0 && (
              <div className="flex gap-1">
                {colorVariants.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-ash inline-block"
                    style={{ backgroundColor: c.code }}
                    title={c.color}
                  />
                ))}
                {colorVariants.length > 4 && (
                  <span className="text-[9px] text-smoke font-bold">+{colorVariants.length - 4}</span>
                )}
              </div>
            )}
          </div>
          <h3 className="font-sans text-body-sm font-semibold text-ink-black line-clamp-1 group-hover:text-[#004ac6] transition-colors">
            {product.name}
          </h3>
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
