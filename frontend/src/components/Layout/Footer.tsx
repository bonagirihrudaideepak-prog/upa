import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { contactPhone, instagramUrl, locationMapUrl, storeName } = useApp();

  return (
    <footer className="bg-cream-paper border-t border-ash mt-auto">
      <div className="max-w-container mx-auto px-gutter py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3 md:col-span-1">
            <Link to="/" className="font-serif text-title-lg font-bold text-ink-black tracking-tight">
              {storeName}
            </Link>
            <p className="font-sans text-label-sm uppercase tracking-widest text-smoke">
              Store Pickup Only • Premium Smartphones, Cases & Custom Covers
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke font-semibold">Explore</h3>
            <Link to="/" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              Home
            </Link>
            <Link to="/catalog" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              Catalog
            </Link>
            <Link to="/customization" className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors">
              Custom Covers
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke font-semibold">Call &amp; WhatsApp</h3>
            <a
              href={`tel:${contactPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-2 font-sans text-body-sm text-ink-black hover:text-[#004ac6] transition-colors"
            >
              <span className="material-symbols-outlined text-body-sm text-smoke">call</span>
              {contactPhone}
            </a>
            <a
              href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-body-sm text-[#25D366] hover:underline transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-body-sm">chat</span>
              WhatsApp Quick Chat
            </a>
          </div>

          {/* Social & Location */}
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
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-body-sm text-[#E1306C] hover:underline transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-body-sm">photo_camera</span>
              @upanishadmobiles
            </a>
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
      </div>
    </footer>
  );
}
