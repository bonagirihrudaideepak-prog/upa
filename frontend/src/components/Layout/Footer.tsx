import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { contactPhone } = useApp();

  return (
    <footer className="bg-cream-paper border-t border-ash mt-auto">
      <div className="max-w-container mx-auto px-gutter py-10 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="font-serif text-headline-sm text-ink-black tracking-tight">
              DEEPAK ELECTRONICS
            </Link>
            <p className="font-sans text-label-sm uppercase tracking-widest text-smoke max-w-xs">
              Premium electronic accessories &amp; lifestyle products
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke">Links</h3>
            <Link
              to="/privacy-policy"
              className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="font-sans text-body-sm text-ink-black hover:text-smoke transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-sans text-label-sm uppercase tracking-widest text-smoke">Contact</h3>
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-2 font-sans text-body-sm text-ink-black hover:text-smoke transition-colors"
            >
              <span className="material-symbols-outlined text-body-sm text-smoke">call</span>
              {contactPhone}
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-ash">
          <p className="font-sans text-label-sm uppercase tracking-widest text-smoke text-center">
            &copy; {new Date().getFullYear()} Deepak Electronics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
