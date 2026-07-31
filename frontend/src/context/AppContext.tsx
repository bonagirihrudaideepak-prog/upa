import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Product, ProductVariant, CartItem } from '../types';

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
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setAdmin] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);

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
        whatsappNumber: '+919666731286',
        contactPhone: '+919666731286',
        instagramUrl: 'https://www.instagram.com/upanishadmobiles/',
        locationMapUrl: 'https://maps.app.goo.gl/JRej6So64iYYm7ia6',
        storeName: 'Upanishad Mobile Store',
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
