import type { ApiResponse, Product, Offer, Category, DashboardStats, AdminUser } from '../types';

const BASE_URL = '';

export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/mock/')) {
    const name = path.replace('/mock/', '').replace(/\.\w+$/, '');
    return `https://placehold.co/400x400/fbf8f6/000000?text=${encodeURIComponent(name.replace(/-/g, ' '))}`;
  }
  return `${BASE_URL}/uploads/${path.replace(/^\/?uploads\//, '')}`;
}

export function formatLikes(count: number): string {
  const num = Number(count || 0);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toLocaleString();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    
    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      if (contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.message) errorMsg = errorData.message;
      } else {
        errorMsg = `Server endpoint unavailable (${res.status}). Ensure Node.js application is running in Hostinger hPanel.`;
      }
      return { success: false, error: errorMsg };
    }

    if (!contentType.includes('application/json')) {
      return {
        success: false,
        error: 'Server returned HTML instead of JSON. Ensure Node.js application is started in Hostinger hPanel.',
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export const api = {
  getProducts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Product[]>(`/api/products${query}`);
  },

  getProduct(id: string | number) {
    return request<Product>(`/api/products/${id}`);
  },

  getProductsByCategory(slug: string) {
    return request<Product[]>(`/api/products/category/${slug}`);
  },

  getFeatured() {
    return request<Product[]>('/api/products/featured');
  },

  getNewArrivals() {
    return request<Product[]>('/api/products/new-arrivals');
  },

  searchProducts(query: string) {
    return request<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
  },

  getOffers() {
    return request<Offer[]>('/api/offers');
  },

  getCategories() {
    return request<Category[]>('/api/categories');
  },

  getProductReviews(productId: number) {
    return request(`/api/products/${productId}/reviews`);
  },

  addReview(data: { product_id: number; rating: number; comment: string }) {
    return request('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  likeProduct(productId: number) {
    return request(`/api/products/${productId}/like`, {
      method: 'POST',
    });
  },

  adminLogin(username: string, password: string) {
    return request<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  adminLogout() {
    localStorage.removeItem('admin_token');
    return { success: true } as ApiResponse<null>;
  },

  getAdminDashboard() {
    return request<DashboardStats>('/api/admin/dashboard');
  },

  getAdminProducts() {
    return request<Product[]>('/api/admin/products');
  },

  createProduct(formData: FormData) {
    return request<Product>('/api/admin/products', {
      method: 'POST',
      body: formData,
    });
  },

  updateProduct(id: number, formData: FormData) {
    return request<Product>(`/api/admin/products/${id}`, {
      method: 'POST',
      body: formData,
    });
  },

  deleteProduct(id: number) {
    return request(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  getAdminOffers() {
    return request<Offer[]>('/api/admin/offers');
  },

  createOffer(data: Partial<Offer>) {
    return request<Offer>('/api/admin/offers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateOffer(id: number, data: Partial<Offer>) {
    return request<Offer>(`/api/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteOffer(id: number) {
    return request(`/api/admin/offers/${id}`, {
      method: 'DELETE',
    });
  },

  getAdminCategories() {
    return request<Category[]>('/api/admin/categories');
  },

  createCategory(data: Partial<Category>) {
    return request<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCategory(id: number, data: Partial<Category>) {
    return request<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCategory(id: number) {
    return request(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  uploadImage(formData: FormData) {
    return request<{ path: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  deleteImage(path: string) {
    return request('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    });
  },

  getSettings() {
    return request<Record<string, string>>('/api/settings');
  },

  updateSettings(data: Record<string, string>) {
    return request<{ message: string; settings: Record<string, string> }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getSystemHealth() {
    return request<any>('/api/admin/system-health');
  },

  runSystemAudit() {
    return request<any>('/api/admin/system-health/run-audit', {
      method: 'POST',
    });
  },

  changePassword(newPassword: string) {
    return request<{ message: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  },

  sendChatMessage(message: string) {
    return request<{ intent: string; reply: string; products: any[] }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
