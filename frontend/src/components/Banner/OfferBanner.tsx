import type { Offer } from '../../types';
import { getImageUrl } from '../../utils/api';

interface OfferBannerProps {
  offers: Offer[];
  loading?: boolean;
}

export default function OfferBanner({ offers, loading }: OfferBannerProps) {
  if (loading) {
    return (
      <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden bg-cream-paper animate-pulse" />
    );
  }

  const activeOffer = offers.find((o) => o.is_active) ?? offers[0];

  if (!activeOffer) {
    return (
      <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden relative bg-cream-paper border border-ash flex items-center justify-center">
        <div className="text-center text-smoke px-6">
          <span className="material-symbols-outlined text-5xl mb-3 block">celebration</span>
          <h2 className="font-headline-md text-headline-md text-ink-black butter-underline">Discover Our Products</h2>
          <p className="font-body-md text-body-md text-smoke mt-2">Check back for exciting offers</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(activeOffer.image_path);

  return (
    <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden relative bg-cream-paper">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={activeOffer.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-smoke">
          <span className="material-symbols-outlined text-6xl">image</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <h2 className="font-headline-md text-headline-md text-white butter-underline">{activeOffer.title}</h2>
        {activeOffer.description && (
          <p className="font-body-md text-body-md text-white/80 mt-2 max-w-xl">{activeOffer.description}</p>
        )}
      </div>
    </div>
  );
}
