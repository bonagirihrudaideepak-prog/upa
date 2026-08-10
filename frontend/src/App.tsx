import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ScrollToTop from './components/Layout/ScrollToTop';
import AIChatWidget from './components/Chat/AIChatWidget';

import ProtectedRoute from './components/Admin/ProtectedRoute';

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
        {/* Public Storefront Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/category/:slug" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Public Admin Login Route */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Strictly Protected Admin Routes (Require Admin Auth Token) */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/products/add" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/new" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/products/:id/edit" element={<ProtectedRoute><AdminProductForm /></ProtectedRoute>} />
        <Route path="/admin/offers" element={<ProtectedRoute><AdminOffers /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/system-health" element={<ProtectedRoute><AdminSystemHealth /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
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
