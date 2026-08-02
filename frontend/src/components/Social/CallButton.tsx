import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function CallButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { contactPhone } = useApp();

  const phoneNumber = contactPhone.replace(/[^0-9+]/g, '');

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="relative">
        {showTooltip && (
          <div
            className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-ink-black text-white font-sans text-label-sm rounded whitespace-nowrap"
            role="tooltip"
          >
            Call us now
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink-black" />
          </div>
        )}
        <a
          href={`tel:${phoneNumber}`}
          aria-label="Call us"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#007AFF] text-white hover:opacity-90 transition-opacity shadow-lg"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span className="material-symbols-outlined text-2xl">call</span>
        </a>
      </div>
    </div>
  );
}
