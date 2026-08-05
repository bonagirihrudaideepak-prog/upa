import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import StatsCard from '../../components/Admin/StatsCard';
import { api, getImageUrl } from '../../utils/api';
import type { DashboardStats } from '../../types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin');
      return;
    }
    loadDashboard();
  }, [navigate]);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    const res = await api.getAdminDashboard();
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.error || 'Failed to load dashboard');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-paper flex">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-margin md:ml-80 pt-20 md:pt-10">
          <div className="max-w-container mx-auto space-y-8">
            <div className="h-8 w-64 bg-ash/50 animate-pulse rounded" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-ash rounded p-5 h-28 animate-pulse" />
              ))}
            </div>
            <div className="bg-white border border-ash rounded p-5 h-64 animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-paper flex">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-margin md:ml-80 pt-20 md:pt-10">
          <div className="max-w-container mx-auto">
            <div className="bg-red-50 border border-red-200 rounded p-5">
              <p className="font-sans text-body-md text-red-700">{error}</p>
              <button onClick={loadDashboard} className="mt-3 font-sans text-label-sm text-red-700 underline">
                Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-paper flex">
      <AdminSidebar />
      <AdminMobileHeader />

      <main className="flex-1 overflow-y-auto p-gutter md:p-margin md:ml-80 pt-20 md:pt-10">
        <div className="max-w-container mx-auto space-y-8">
          {/* Page Title */}
          <div>
            <h1 className="font-serif text-headline-md text-ink-black">
              <span className="butter-underline">Dashboard Overview</span>
            </h1>
            <p className="font-sans text-body-sm text-smoke mt-1">Store performance at a glance</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatsCard
              title="Total Products"
              value={stats?.total_products ?? 0}
              icon="inventory_2"
            />
            <StatsCard
              title="Active Offers"
              value={stats?.active_offers ?? 0}
              icon="local_offer"
            />
            <StatsCard
              title="Out of Stock"
              value={stats?.out_of_stock ?? 0}
              icon="error_outline"
              variant="warning"
              subtitle="Products needing restock"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/products/add"
              className="flex items-center gap-3 bg-white border border-ash rounded p-4 hover:border-[#004ac6] hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-2xl text-[#004ac6]">add_circle</span>
              <div>
                <span className="font-sans text-body-sm font-semibold text-ink-black block">Add New Product</span>
                <span className="font-sans text-caption text-smoke">Full product form</span>
              </div>
            </Link>
            <Link
              to="/admin/offers"
              className="flex items-center gap-3 bg-white border border-ash rounded p-4 hover:border-[#004ac6] hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-2xl text-[#004ac6]">campaign</span>
              <div>
                <span className="font-sans text-body-sm font-semibold text-ink-black block">Manage Banners</span>
                <span className="font-sans text-caption text-smoke">Add or edit offers</span>
              </div>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 bg-white border border-ash rounded p-4 hover:border-[#004ac6] hover:shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-2xl text-[#004ac6]">tune</span>
              <div>
                <span className="font-sans text-body-sm font-semibold text-ink-black block">Website Settings</span>
                <span className="font-sans text-caption text-smoke">Edit store info & links</span>
              </div>
            </Link>
          </div>

          {/* Recent Products Table */}
          <div className="bg-white border border-ash rounded overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-ash">
              <h2 className="font-serif text-title-md text-ink-black">Recent Products</h2>
              <Link to="/admin/products" className="font-sans text-label-sm text-[#004ac6] hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              {(stats?.recent_products ?? []).length === 0 ? (
                <div className="p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-smoke/40 block mb-2">inventory_2</span>
                  <p className="font-sans text-body-sm text-smoke">No products yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ash">
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Product</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Category</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Price</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Status</th>
                      <th className="text-right font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recent_products ?? []).slice(0, 5).map((product) => {
                      const mainImage = product.images?.[0]?.image_path;
                      const status = product.is_out_of_stock
                        ? { label: 'Out of Stock', bg: '#fce8e6', color: '#c5221f' }
                        : product.stock <= 5
                          ? { label: 'Low Stock', bg: '#fef7e0', color: '#b06000' }
                          : { label: 'In Stock', bg: '#e6f4ea', color: '#137333' };
                      return (
                        <tr key={product.id} className="border-b border-ash last:border-0 hover:bg-[#fbf8f6] transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded overflow-hidden bg-ash/30 shrink-0">
                                {mainImage ? (
                                  <img src={getImageUrl(mainImage)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-smoke/40 text-lg">image</span>
                                  </div>
                                )}
                              </div>
                              <span className="font-sans text-body-sm text-ink-black truncate max-w-[200px]">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-sans text-body-sm text-smoke capitalize">{product.category}</td>
                          <td className="px-5 py-3 font-sans text-body-sm text-ink-black">₹{product.price.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span
                              className="inline-block font-sans text-caption font-medium px-3 py-1 rounded-full"
                              style={{ backgroundColor: status.bg, color: status.color }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              to={`/admin/products/${product.id}/edit`}
                              className="font-sans text-label-sm text-[#004ac6] hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
