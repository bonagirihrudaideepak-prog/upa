import { useState } from 'react';
import { api } from '../../utils/api';

interface LikeButtonProps {
  productId: number;
  initialCount: number;
}

function formatLikes(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count.toString();
}

export default function LikeButton({ productId, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError(false);
    const res = await api.likeProduct(productId);
    if (res.success) {
      setCount((prev) => prev + 1);
      setLiked(true);
    } else {
      setError(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1 transition-colors ${
        error ? 'text-red-500' : liked ? 'text-red-500' : 'text-smoke hover:text-red-500'
      }`}
      aria-label={liked ? 'Liked' : 'Like this product'}
    >
      <span
        className="material-symbols-outlined text-[16px]"
        style={liked ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {loading ? 'sync' : 'favorite'}
      </span>
      <span className="font-label-sm text-label-sm">
        {loading ? '...' : formatLikes(count)}
      </span>
    </button>
  );
}
