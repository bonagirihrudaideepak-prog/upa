export interface ProductImage {
  id: number;
  product_id: number;
  image_path: string;
  image_type: string;
  is_original_1_1: boolean;
  is_original_3_4: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  color: string;
  color_code: string;
  model: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: number;
  stock: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_offer: boolean;
  is_out_of_stock: boolean;
  likes_count: number;
  sku: string;
  created_at: string;
  main_image?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  image_path: string;
  link: string;
  caption_left: string | null;
  caption_right: string | null;
  text_top: string | null;
  text_bottom: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_path: string | null;
  is_active: boolean;
  display_order: number;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface DashboardStats {
  total_products: number;
  active_offers: number;
  out_of_stock: number;
  total_categories: number;
  total_likes: number;
  recent_products: Product[];
  top_liked: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
}
