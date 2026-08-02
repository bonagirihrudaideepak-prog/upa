import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../utils/api';
import type { Offer } from '../../types';

interface HeroBannerCarouselProps {
  offers: Offer[];
  loading?: boolean;
}

export default function HeroBannerCarousel({ offers, loading }: HeroBannerCarouselProps) {
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
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-ink-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pointer-events-none">
                <h1 className="font-headline-lg md:font-display text-white butter-underline inline-block">
                  {offer.title || 'Modern Tech, Curated for You'}
                </h1>
                {offer.description && (
                  <p className="font-body-md text-body-md text-white/80 mt-2 max-w-xl">
                    {offer.description}
                  </p>
                )}
              </div>
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
