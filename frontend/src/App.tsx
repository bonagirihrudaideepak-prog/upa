import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ScrollToTop from './components/Layout/ScrollToTop';
import AIChatWidget from './components/Chat/AIChatWidget';

import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOffers from './pages/admin/AdminOffers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';
import AdminSettings from './pages/admin/AdminSettings';

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/category/:slug" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/products/add" element={<AdminProductForm />} />
      <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
      <Route path="/admin/offers" element={<AdminOffers />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/system-health" element={<AdminSystemHealth />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      <AIChatWidget />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
