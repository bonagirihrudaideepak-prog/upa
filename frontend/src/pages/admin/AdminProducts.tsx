import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import { api, getImageUrl } from '../../utils/api';
import type { Product } from '../../types';

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadProducts();
  }, [navigate]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    const res = await api.getAdminProducts();
    if (res.success && res.data) {
      setProducts(res.data);
    } else {
      setError(res.error || 'Failed to load products');
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const res = await api.deleteProduct(id);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setDeleting(false);
    setDeleteId(null);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-paper flex">
      <AdminSidebar />
      <AdminMobileHeader />

      <main className="flex-1 overflow-y-auto p-gutter md:p-margin md:ml-80 pt-20 md:pt-10">
        <div className="max-w-container mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-headline-md text-ink-black">
                <span className="butter-underline">All Products</span>
              </h1>
              <p className="font-sans text-body-sm text-smoke mt-1">{products.length} products total</p>
            </div>
            <Link
              to="/admin/products/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Product
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-smoke text-lg">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-ash rounded overflow-hidden">
              <div className="p-5 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 bg-ash/50 rounded shrink-0" />
                    <div className="flex-1 h-4 bg-ash/50 rounded" />
                    <div className="w-20 h-4 bg-ash/50 rounded" />
                    <div className="w-16 h-4 bg-ash/50 rounded" />
                    <div className="w-14 h-4 bg-ash/50 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded p-5">
              <p className="font-sans text-body-sm text-red-700">{error}</p>
              <button onClick={loadProducts} className="mt-2 font-sans text-label-sm text-red-700 underline">Try again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="bg-white border border-ash rounded p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-smoke/30 block mb-3">inventory_2</span>
              <p className="font-sans text-body-md text-smoke">
                {search ? 'No products match your search.' : 'No products yet. Add your first product!'}
              </p>
              {!search && (
                <Link to="/admin/products/add" className="mt-4 inline-block font-sans text-label-sm text-[#004ac6] underline">
                  Add Product
                </Link>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <div className="bg-white border border-ash rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ash">
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Image</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Name</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Category</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Price</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Stock</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Status</th>
                      <th className="text-right font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((product) => {
                      const mainImage = product.images?.[0]?.image_path;
                      const status = product.is_out_of_stock
                        ? { label: 'Out of Stock', bg: '#fce8e6', color: '#c5221f' }
                        : product.stock <= 5
                          ? { label: 'Low Stock', bg: '#fef7e0', color: '#b06000' }
                          : { label: 'In Stock', bg: '#e6f4ea', color: '#137333' };
                      return (
                        <tr key={product.id} className="border-b border-ash last:border-0 hover:bg-[#fbf8f6] transition-colors">
                          <td className="px-5 py-3">
                            <div className="w-10 h-10 rounded overflow-hidden bg-ash/30">
                              {mainImage ? (
                                <img src={getImageUrl(mainImage)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="material-symbols-outlined text-smoke/40 text-lg">image</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 font-sans text-body-sm text-ink-black">{product.name}</td>
                          <td className="px-5 py-3 font-sans text-body-sm text-smoke capitalize">{product.category}</td>
                          <td className="px-5 py-3 font-sans text-body-sm text-ink-black">₹{product.price.toLocaleString()}</td>
                          <td className="px-5 py-3 font-sans text-body-sm text-ink-black">{product.stock}</td>
                          <td className="px-5 py-3">
                            <span
                              className="inline-block font-sans text-caption font-medium px-3 py-1 rounded-full"
                              style={{ backgroundColor: status.bg, color: status.color }}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/products/${product.id}/edit`}
                                className="font-sans text-label-sm text-[#004ac6] hover:underline"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => setDeleteId(product.id)}
                                className="font-sans text-label-sm text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-ash rounded p-6 max-w-sm mx-4 w-full">
            <h3 className="font-serif text-title-md text-ink-black mb-2">Delete Product</h3>
            <p className="font-sans text-body-sm text-smoke mb-5">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-white border border-ash rounded font-sans text-label-sm text-ink-black hover:bg-[#f5f5f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-sans text-label-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
