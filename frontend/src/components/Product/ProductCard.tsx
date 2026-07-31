import type { Product, ProductVariant } from '../../types';
import { getImageUrl } from '../../utils/api';

interface ProductCardProps {
  product: Product;
  onLike: (id: number) => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  onClick: (product: Product) => void;
}

function formatLikes(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count.toString();
}

export default function ProductCard({ product, onLike, onAddToCart, onClick }: ProductCardProps) {
  const imageUrl = product.images?.[0] ? getImageUrl(product.images[0].image_path) : '';

  return (
    <div
      className="group relative bg-white border border-ash rounded overflow-hidden hover:border-ink-black transition-colors cursor-pointer"
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
      <div className="aspect-square relative overflow-hidden bg-cream-paper p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-smoke">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}
        {product.is_out_of_stock && (
          <div className="absolute top-2 left-2 bg-smoke text-white font-label-sm text-label-sm px-2 py-0.5 rounded">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-label-md text-label-md text-ink-black truncate">{product.name}</h3>
        <p className="font-body-md text-body-md text-ink-black font-bold">₹{product.price}</p>
        <div className="flex justify-between items-center mt-2">
          {product.is_out_of_stock ? (
            <span className="font-label-sm text-label-sm text-smoke">Out of Stock</span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="bg-ink-black text-white font-label-sm text-label-sm px-4 py-1.5 rounded uppercase hover:bg-smoke transition-colors"
              aria-label="Add to cart"
            >
              Add
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(product.id);
            }}
            className="flex items-center gap-1 text-smoke hover:text-red-500 transition-colors"
            aria-label={`Like ${product.name}`}
          >
            <span className="material-symbols-outlined text-[16px]">favorite</span>
            <span className="font-label-sm text-label-sm">{formatLikes(product.likes_count)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
