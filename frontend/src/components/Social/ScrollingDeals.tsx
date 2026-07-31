export default function ScrollingDeals() {
  const text = "⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡";

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
