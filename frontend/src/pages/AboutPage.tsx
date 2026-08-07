import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WhatsAppButton from '../components/Social/WhatsAppButton';
import CallButton from '../components/Social/CallButton';
import { useApp } from '../context/AppContext';

export default function AboutPage() {
  const { storeName, aboutContent, heroSubtitle } = useApp();

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
              <span className="font-label-sm text-label-sm text-ink-black">About Us</span>
            </nav>

            <h1 className="font-headline-md text-headline-md text-ink-black mb-6">
              <span className="butter-underline">About {storeName}</span>
            </h1>

            <div className="bg-white border border-ash rounded p-6 md:p-8">
              <p className="font-body-md text-body-md text-smoke leading-relaxed whitespace-pre-line">
                {aboutContent || heroSubtitle}
              </p>
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