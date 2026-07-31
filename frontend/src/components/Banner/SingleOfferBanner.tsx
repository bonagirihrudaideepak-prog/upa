import type { Offer } from '../../types';
import { getImageUrl } from '../../utils/api';

interface SingleOfferBannerProps {
  offer?: Offer;
}

export default function SingleOfferBanner({ offer }: SingleOfferBannerProps) {
  if (!offer) {
    return (
      <div className="w-full rounded overflow-hidden bg-cream-paper border border-ash flex items-center justify-center py-16 px-6">
        <div className="text-center text-smoke">
          <span className="material-symbols-outlined text-4xl mb-2 block">campaign</span>
          <p className="font-body-md text-body-md">No active offers</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(offer.image_path);

  return (
    <div className="w-full rounded overflow-hidden relative bg-cream-paper">
      {imageUrl ? (
        <div className="aspect-[3/1] md:aspect-[4/1] relative">
          <img
            src={imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-black/70 via-ink-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center p-6 md:p-8 lg:p-12">
            <div className="max-w-lg">
              <h2 className="font-headline-md text-headline-md text-white butter-underline">{offer.title}</h2>
              {offer.description && (
                <p className="font-body-md text-body-md text-white/80 mt-2">{offer.description}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 md:p-8 lg:p-12 bg-gradient-to-r from-ink-black to-ink-black/80">
          <h2 className="font-headline-md text-headline-md text-white butter-underline">{offer.title}</h2>
          {offer.description && (
            <p className="font-body-md text-body-md text-white/80 mt-2">{offer.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
