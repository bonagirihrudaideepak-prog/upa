export default function ScrollingDeals() {
  const text = "Check my WhatsApp group or status for more deals!!!";

  return (
    <div className="w-full bg-ink-black text-white overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee py-2">
        <span className="font-sans text-label-sm uppercase tracking-widest mx-4 shrink-0">
          {text}
        </span>
        <span className="font-sans text-label-sm uppercase tracking-widest mx-4 shrink-0">
          {text}
        </span>
        <span className="font-sans text-label-sm uppercase tracking-widest mx-4 shrink-0">
          {text}
        </span>
        <span className="font-sans text-label-sm uppercase tracking-widest mx-4 shrink-0">
          {text}
        </span>
      </div>
    </div>
  );
}
