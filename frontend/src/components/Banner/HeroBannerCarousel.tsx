import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import type { Offer } from '../../types';

interface HeroBannerCarouselProps {
  offers: Offer[];
  loading?: boolean;
}

export default function HeroBannerCarousel({ offers, loading }: HeroBannerCarouselProps) {
  const { whatsappNumber } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const activeOffers = offers.filter(o => o.is_active);
  const length = activeOffers.length;

  // Auto-play logic
  useEffect(() => {
    if (length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [length, isPaused]);

  // Touch handlers
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.PointerEvent) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.PointerEvent) => {
    setTouchEnd(e.clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setCurrentIndex(prev => prev === length - 1 ? 0 : prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev === 0 ? length - 1 : prev - 1);
  };

  if (loading) {
    return (
      <section className="max-w-container mx-auto px-gutter mb-10">
        <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden bg-cream-paper border border-ash animate-pulse" />
      </section>
    );
  }

  if (length === 0) {
    return (
      <section className="max-w-container mx-auto px-gutter mb-10">
        <div className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden bg-cream-paper border border-ash flex items-center justify-center text-smoke">
          <span className="material-symbols-outlined text-6xl">celebration</span>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-container mx-auto px-gutter mb-10">
      <div 
        className="w-full aspect-[3/4] md:aspect-video rounded-xl overflow-hidden relative bg-cream-paper border border-ash group"
        onPointerDown={onTouchStart}
        onPointerMove={onTouchMove}
        onPointerUp={onTouchEnd}
        onPointerLeave={() => {
          setIsPaused(false);
          setTouchStart(null);
          setTouchEnd(null);
        }}
        onMouseEnter={() => setIsPaused(true)}
      >
        <div 
          className="w-full h-full flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {activeOffers.map((offer, index) => (
            <div key={offer.id || index} className="w-full h-full flex-shrink-0 relative">
              <img
                src={getImageUrl(offer.image_path)}
                alt={offer.title || ''}
                className="w-full h-full object-cover bg-cream-paper select-none pointer-events-none"
                draggable={false}
              />
              {/* Top Text Area */}
              {offer.text_top && (
                <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-10 max-w-[92%] text-center pointer-events-none">
                  <p className="inline-block bg-ink-black/60 backdrop-blur-sm text-white font-sans text-label-sm md:text-label-md px-4 py-2 rounded-lg whitespace-pre-line">
                    {offer.text_top}
                  </p>
                </div>
              )}
              {/* Bottom Text Area */}
              {offer.text_bottom && (
                <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-10 max-w-[92%] text-center pointer-events-none">
                  <p className="inline-block bg-ink-black/60 backdrop-blur-sm text-white font-sans text-label-sm md:text-label-md px-4 py-2 rounded-lg whitespace-pre-line">
                    {offer.text_bottom}
                  </p>
                </div>
              )}
              {/* Top-Left Caption */}
              {offer.caption_left && (
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                  <span className="inline-block bg-ink-black/60 backdrop-blur-sm text-white font-sans text-label-sm md:text-label-md px-3 py-1.5 rounded-full">
                    {offer.caption_left}
                  </span>
                </div>
              )}
              {/* Top-Right Caption */}
              {offer.caption_right && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
                  <span className="inline-block bg-ink-black/60 backdrop-blur-sm text-white font-sans text-label-sm md:text-label-md px-3 py-1.5 rounded-full">
                    {offer.caption_right}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="font-headline-lg md:font-display text-white butter-underline inline-block" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.55)' }}>
                  {offer.title || 'Modern Tech, Curated for You'}
                </h1>
                {offer.description && (
                  <p className="font-body-md text-body-md text-white/90 mt-2 max-w-xl" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.55)' }}>
                    {offer.description}
                  </p>
                )}
              </div>
              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi! I saw the offer "${offer.title}" on your website. I'd like to claim it!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-10 flex items-center gap-2 bg-[#25D366] text-white font-sans text-label-sm uppercase tracking-wider px-4 py-2.5 rounded-full hover:bg-[#20bd5a] transition-colors shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Claim Offer
              </a>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden z-10"
              aria-label="Previous slide"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex hidden z-10"
              aria-label="Next slide"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {activeOffers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
