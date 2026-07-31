import { useApp } from '../../context/AppContext';

export default function ScrollingDeals() {
  const { marqueeText } = useApp();
  const text = marqueeText || "⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp group & status for more deals! ⚡";

  return (
    <div className="w-full bg-ink-black text-white overflow-hidden py-1.5 border-b border-white/10 z-50">
      <div className="flex whitespace-nowrap animate-marquee">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="font-sans text-label-sm uppercase tracking-widest mx-6 shrink-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-yellow-400">bolt</span>
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
