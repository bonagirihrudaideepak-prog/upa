import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import { useApp } from '../context/AppContext';

export default function ContactPage() {
  const { contactPhone, whatsappNumber, contactEmail, storeAddress, locationMapUrl, storeName } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />
      <main className="flex-1 w-full pt-28 md:pt-32 pb-12">
        <div className="max-w-container mx-auto px-gutter">
          <div className="max-w-3xl mx-auto">
            <nav className="mb-6" aria-label="Breadcrumb">
              <Link to="/" className="font-label-sm text-label-sm text-smoke hover:text-ink-black transition-colors">
                Home
              </Link>
              <span className="mx-2 text-smoke">/</span>
              <span className="font-label-sm text-label-sm text-ink-black">Contact Us</span>
            </nav>

            <h1 className="font-headline-md text-headline-md text-ink-black mb-6">
              <span className="butter-underline">Contact {storeName}</span>
            </h1>

            <div className="bg-white border border-ash rounded p-6 md:p-8 space-y-6">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3"
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#004ac6]/10 text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined">call</span>
                  </span>
                  <span>
                    <span className="block font-label-sm text-label-sm text-smoke uppercase tracking-widest">Phone</span>
                    <span className="font-body-md text-body-md text-ink-black">{contactPhone}</span>
                  </span>
                </a>
              )}

              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#004ac6]/10 text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined">mail</span>
                  </span>
                  <span>
                    <span className="block font-label-sm text-label-sm text-smoke uppercase tracking-widest">Email</span>
                    <span className="font-body-md text-body-md text-ink-black">{contactEmail}</span>
                  </span>
                </a>
              )}

              {storeAddress && (
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#004ac6]/10 text-[#004ac6] shrink-0">
                    <span className="material-symbols-outlined">location_on</span>
                  </span>
                  <span>
                    <span className="block font-label-sm text-label-sm text-smoke uppercase tracking-widest">Address</span>
                    <span className="font-body-md text-body-md text-ink-black">{storeAddress}</span>
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-ash">
                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:opacity-90 transition-opacity tracking-wider"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    WhatsApp Us
                  </a>
                )}
                {locationMapUrl && (
                  <a
                    href={locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#004ac6] text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:opacity-90 transition-opacity tracking-wider"
                  >
                    <span className="material-symbols-outlined text-lg">map</span>
                    Get Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <CallButton />
      <Footer />
    </div>
  );
}