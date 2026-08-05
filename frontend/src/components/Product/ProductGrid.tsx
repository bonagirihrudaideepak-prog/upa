import type { Product, ProductVariant } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onLike: (id: number) => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  loading?: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-ash rounded overflow-hidden animate-pulse">
      <div className="aspect-square bg-cream-paper" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 bg-ash rounded w-3/4" />
        <div className="h-4 bg-ash rounded w-1/2" />
        <div className="flex justify-between items-center mt-2">
          <div className="h-6 bg-ash rounded w-16" />
          <div className="h-4 bg-ash rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products, onLike, onAddToCart, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-gutter">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-smoke">
        <span className="material-symbols-outlined text-5xl mb-4">inventory_2</span>
        <p className="font-body-md text-body-md">No products found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-gutter">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onLike={onLike}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
