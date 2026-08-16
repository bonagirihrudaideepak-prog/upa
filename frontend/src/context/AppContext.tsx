import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Product, ProductVariant, CartItem } from '../types';
import { api } from '../utils/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface SiteSettings {
  storeName: string;
  marqueeText: string;
  contactPhone: string;
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  storeAddress: string;
  contactEmail: string;
  aboutContent: string;
  locationMapUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  seoKeywords: string;
  footerTagline: string;
  pickupNotice: string;
  pickupLabel: string;
  searchPlaceholder: string;
  chatGreeting: string;
  contactWhatsAppMessage: string;
  homeCategoriesTitle: string;
  homeFeaturedTitle: string;
  homeNewArrivalsTitle: string;
  homeAllProductsTitle: string;
  footerCopyright: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  storeName: 'Upanishad mobiles',
  marqueeText: '⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡',
  contactPhone: '+91 96667 31286',
  whatsappNumber: '+919666731286',
  instagramUrl: 'https://www.instagram.com/upanishadmobiles/',
  facebookUrl: '',
  youtubeUrl: '',
  storeAddress: '',
  contactEmail: '',
  aboutContent: '',
  locationMapUrl: 'https://maps.app.goo.gl/JRej6So64iYYm7ia6',
  heroTitle: 'Modern Tech, Curated for You',
  heroSubtitle: 'Store Pickup Only • Premium Cases & Accessories',
  seoKeywords: '',
  footerTagline: 'Store Pickup Only • Premium Cases & Accessories',
  pickupNotice: 'Store only accepts pickups. Message us on WhatsApp or call to inquire about availability.',
  pickupLabel: 'Store Pickup Only',
  searchPlaceholder: 'Search Upanishad Mobiles...',
  chatGreeting: '👋 Hi! I\'m your AI Shopping Assistant. Ask me about products, prices, colors, or availability!',
  contactWhatsAppMessage: 'Hi Upanishad Mobile Store, I would like to reserve/order:',
  homeCategoriesTitle: 'Shop by Category',
  homeFeaturedTitle: 'Top Recommended',
  homeNewArrivalsTitle: 'New Arrivals',
  homeAllProductsTitle: 'All Products',
  footerCopyright: 'All rights reserved.',
};

interface AppContextValue extends SiteSettings {
  cart: CartItem[];
  isAdmin: boolean;
  toasts: Toast[];
  loading: boolean;
  addToCart: (product: Product, variant?: ProductVariant) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setAdmin: (value: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
  setLoading: (value: boolean) => void;
  reloadSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setAdmin] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);

  // Single state object for all settings → one re-render instead of 8
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        const s = res.data;
        setSettings(prev => ({
          storeName: s.store_name || prev.storeName,
          marqueeText: s.marquee_text || prev.marqueeText,
          contactPhone: s.contact_phone || prev.contactPhone,
          whatsappNumber: s.whatsapp_number || prev.whatsappNumber,
          instagramUrl: s.instagram_url || prev.instagramUrl,
          facebookUrl: s.facebook_url || prev.facebookUrl,
          youtubeUrl: s.youtube_url || prev.youtubeUrl,
          storeAddress: s.store_address || prev.storeAddress,
          contactEmail: s.contact_email || prev.contactEmail,
          aboutContent: s.about_content || prev.aboutContent,
          locationMapUrl: s.location_map_url || prev.locationMapUrl,
          heroTitle: s.hero_title || prev.heroTitle,
          heroSubtitle: s.hero_subtitle || prev.heroSubtitle,
          seoKeywords: s.seo_keywords || prev.seoKeywords,
          footerTagline: s.footer_tagline || prev.footerTagline,
          pickupNotice: s.pickup_notice || prev.pickupNotice,
          pickupLabel: s.pickup_label || prev.pickupLabel,
          searchPlaceholder: s.search_placeholder || prev.searchPlaceholder,
          chatGreeting: s.chat_greeting || prev.chatGreeting,
          contactWhatsAppMessage: s.contact_whatsapp_message || prev.contactWhatsAppMessage,
          homeCategoriesTitle: s.home_categories_title || prev.homeCategoriesTitle,
          homeFeaturedTitle: s.home_featured_title || prev.homeFeaturedTitle,
          homeNewArrivalsTitle: s.home_new_arrivals_title || prev.homeNewArrivalsTitle,
          homeAllProductsTitle: s.home_all_products_title || prev.homeAllProductsTitle,
          footerCopyright: s.footer_copyright || prev.footerCopyright,
        }));
      }
    } catch (e) {
      console.error('Failed to load dynamic settings:', e);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const addToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setCart((prev) => {
      const exists = prev.find(
        (item) =>
          item.product.id === product.id &&
          (variant ? item.variant?.id === variant.id : !item.variant)
      );
      if (exists) return prev;
      return [...prev, { product, variant }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Memoize context value to prevent unnecessary child re-renders
  const value = useMemo<AppContextValue>(() => ({
    cart,
    ...settings,
    isAdmin,
    toasts,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    setAdmin,
    showToast,
    dismissToast,
    setLoading,
    reloadSettings: loadSettings,
  }), [cart, settings, isAdmin, toasts, loading, addToCart, removeFromCart, clearCart, showToast, dismissToast, loadSettings]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
