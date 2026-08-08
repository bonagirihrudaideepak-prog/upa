import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const {
    instagramUrl,
    facebookUrl,
    youtubeUrl,
    storeAddress,
    contactPhone,
    contactEmail,
    locationMapUrl,
    storeName,
    seoKeywords,
  } = useApp();

  // Inject SEO keywords + store name into the document meta tags for better search indexing.
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="keywords"]');
    if (seoKeywords.trim()) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'keywords';
        document.head.appendChild(meta);
      }
      meta.content = seoKeywords.trim();
    }
  }, [seoKeywords]);

  const socialLinks = [
    { name: 'Instagram', url: instagramUrl, icon: 'photo_camera', color: 'text-[#E1306C]', available: !!instagramUrl },
    { name: 'Facebook', url: facebookUrl, icon: 'groups', color: 'text-[#1877F2]', available: !!facebookUrl },
    { name: 'YouTube', url: youtubeUrl, icon: 'smart_display', color: 'text-[#FF0000]', available: !!youtubeUrl },
  ].filter((s) => s.available);

  return (
    <footer className="bg-cream-paper border-t border-ash mt-auto">
      <div className="max-w-container mx-auto px-gutter py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="font-serif text-title-lg font-bold text-ink-black tracking-tight">
              {storeName}
            </Link>
            <p className="font-sans text-label-sm uppercase tracking-widest text-smoke">
              Store Pickup Only • Premium Smartphones, Cases &amp; Accessories
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke font-semibold">Explore</h3>
            <Link to="/" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              All Products
            </Link>
            <Link to="/about" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke font-semibold">Get in Touch</h3>
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 font-sans text-body-sm text-ink-black hover:text-smoke transition-colors"
              >
                <span className="material-symbols-outlined text-body-sm text-[#004ac6]">call</span>
                {contactPhone}
              </a>
            )}
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 font-sans text-body-sm text-ink-black hover:text-smoke transition-colors"
              >
                <span className="material-symbols-outlined text-body-sm text-[#004ac6]">mail</span>
                {contactEmail}
              </a>
            )}
            {storeAddress && (
              <p className="flex items-start gap-2 font-sans text-body-sm text-ink-black">
                <span className="material-symbols-outlined text-body-sm text-[#004ac6] mt-0.5">location_on</span>
                <span className="flex-1">{storeAddress}</span>
              </p>
            )}
          </div>

          {/* Location & Social */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke font-semibold">Store Location</h3>
            <a
              href={locationMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-body-sm text-ink-black hover:text-[#004ac6] transition-colors"
            >
              <span className="material-symbols-outlined text-body-sm text-red-500">location_on</span>
              View on Google Maps
            </a>
            {socialLinks.length > 0 && (
              <div className="flex gap-3 mt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white border border-ash ${s.color} hover:scale-110 transition-transform`}
                  >
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-ash flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-label-sm uppercase tracking-widest text-smoke text-center sm:text-left">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p className="font-sans text-caption text-smoke text-center sm:text-right">
            Store Takeaway &amp; Pickup Orders Only
          </p>
        </div>

        {/* SEO Keywords */}
        {seoKeywords.trim() && (
          <div className="mt-8 pt-6 border-t border-ash">
            <p className="font-sans text-caption text-smoke text-center leading-relaxed whitespace-pre-line">
              {seoKeywords.trim()}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}