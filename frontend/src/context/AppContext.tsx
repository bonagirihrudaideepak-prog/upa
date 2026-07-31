import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Product, ProductVariant, CartItem } from '../types';
import { api } from '../utils/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  cart: CartItem[];
  whatsappNumber: string;
  contactPhone: string;
  instagramUrl: string;
  locationMapUrl: string;
  storeName: string;
  marqueeText: string;
  heroTitle: string;
  heroSubtitle: string;
  isAdmin: boolean;
  toasts: Toast[];
  loading: boolean;
}

interface AppContextValue extends AppState {
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

  // Dynamic Site Settings
  const [storeName, setStoreName] = useState('Upanishad Mobile Store');
  const [marqueeText, setMarqueeText] = useState('⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡');
  const [contactPhone, setContactPhone] = useState('+91 96667 31286');
  const [whatsappNumber, setWhatsappNumber] = useState('+919666731286');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/upanishadmobiles/');
  const [locationMapUrl, setLocationMapUrl] = useState('https://maps.app.goo.gl/JRej6So64iYYm7ia6');
  const [heroTitle, setHeroTitle] = useState('Modern Tech, Curated for You');
  const [heroSubtitle, setHeroSubtitle] = useState('Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories');

  const loadSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.data) {
        const s = res.data;
        if (s.store_name) setStoreName(s.store_name);
        if (s.marquee_text) setMarqueeText(s.marquee_text);
        if (s.contact_phone) setContactPhone(s.contact_phone);
        if (s.whatsapp_number) setWhatsappNumber(s.whatsapp_number);
        if (s.instagram_url) setInstagramUrl(s.instagram_url);
        if (s.location_map_url) setLocationMapUrl(s.location_map_url);
        if (s.hero_title) setHeroTitle(s.hero_title);
        if (s.hero_subtitle) setHeroSubtitle(s.hero_subtitle);
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

  return (
    <AppContext.Provider
      value={{
        cart,
        whatsappNumber,
        contactPhone,
        instagramUrl,
        locationMapUrl,
        storeName,
        marqueeText,
        heroTitle,
        heroSubtitle,
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
      }}
    >
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
