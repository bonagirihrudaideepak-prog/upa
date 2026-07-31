/*
 * Shared utility functions and common constants
 */

export const ROUTES = {
  HOME: '/',
  IPHONE: '/iphone',
  SAMSUNG: '/samsung',
  ACCESSORIES: '/accessories',
  GADGETS: '/gadgets',
  OTHERS: '/others',
  NEW_ARRIVALS: '/new-arrivals',
  OFFERS: '/offers',
  PRODUCT_DETAIL: '/product/:id',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ADD_PRODUCT: '/admin/products/add',
  ADMIN_EDIT_PRODUCT: '/admin/products/:id/edit',
  ADMIN_OFFERS: '/admin/offers',
  ADMIN_OFFERS_ADD: '/admin/offers/add',
  ADMIN_OFFERS_EDIT: '/admin/offers/:id/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY_ADD: '/admin/categories/add',
  ADMIN_CATEGORY_EDIT: '/admin/categories/:id/edit',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  CUSTOMIZATION: '/customization',
  WHATSAPP: '/whatsapp',
  INSTAGRAM: '/instagram',
  SEARCH: '/search',
};

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  PRODUCT: (id: string) => `/api/products/${id}`, 
  PRODUCTS_BY_CATEGORY: (category: string) => `/api/products/category/${category}`, 
  OFFERS: '/api/offers',
  CATEGORIES: '/api/categories',
  PRODUCT_REVIEWS: (productId: string) => `/api/reviews/${productId}`, 
  ADD_REVIEW: '/api/reviews',
  LIKE_PRODUCT: '/api/likes',
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_LOGOUT: '/api/admin/logout',
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_PRODUCT: (id: string) => `/api/admin/products/${id}`, 
  ADMIN_OFFERS: '/api/admin/offers',
  ADMIN_OFFER: (id: string) => `/api/admin/offers/${id}`, 
  ADMIN_CATEGORIES: '/api/admin/categories',
  ADMIN_CATEGORY: (id: string) => `/api/admin/categories/${id}`, 
  ADMIN_USERS: '/api/admin/users',
  UPLOAD_IMAGE: '/api/admin/upload',
  DELETE_IMAGE: '/api/admin/delete',
};

export const UI_CONSTANTS = {
  // Colors from Faire ES style guide
  COLORS: {
    CREAM_PAPER: '#fbf8f6',
    PURE_WHITE: '#ffffff',
    INK_BLACK: '#000000',
    CHARCOAL: '#333333',
    SMOKE: '#6c6a6a',
    ASH: '#dadada',
    BUTTER_HIGHLIGHT: '#f1f29f',
  },
  // Spacing (8px base unit)
  SPACING: {
    SPACING_8: '8px',
    SPACING_16: '16px',
    SPACING_24: '24px',
    SPACING_32: '32px',
    SPACING_48: '48px',
    SPACING_56: '56px',
  },
  // Font sizes
  FONT_SIZES: {
    CAPTION: '14px',
    BODY: '16px',
    SUBHEADING: '18px',
    HEADING_SM: '22px',
    HEADING: '28px',
    HEADING_LG: '30px',
    DISPLAY: '52px',
  },
  // Border radius
  RADIUS: {
    SM: '4px',        // For buttons, inputs, cards
    BADGE: '40px',    // For pills, tags
    FULL: '999px',
  },
  // Breakpoints
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px', 
    LG: '1024px',
    XL: '1280px',
  },
};

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function getImageUrl(path: string): string {
  if (!path) return '';
  return `http://localhost:8000/${path}`;
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(UI_CONSTANTS.BREAKPOINTS.MD);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}