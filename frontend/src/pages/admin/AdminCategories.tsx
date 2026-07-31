import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import { api } from '../../utils/api';
import type { Category } from '../../types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadCategories();
  }, [navigate]);

  async function loadCategories() {
    setLoading(true);
    setError('');
    const res = await api.getAdminCategories();
    if (res.success && res.data) {
      setCategories(res.data);
    } else {
      setError(res.error || 'Failed to load categories');
    }
    setLoading(false);
  }

  function openAddForm() {
    setEditId(null);
    setFormName('');
    setFormSlug('');
    setFormDesc('');
    setFormOrder('0');
    setFormActive(true);
    setFormError('');
    setAutoSlug(true);
    setShowForm(true);
  }

  function openEditForm(cat: Category) {
    setEditId(cat.id);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDesc(cat.description);
    setFormOrder(String(cat.display_order));
    setFormActive(cat.is_active);
    setFormError('');
    setAutoSlug(false);
    setShowForm(true);
  }

  function handleNameChange(value: string) {
    setFormName(value);
    if (autoSlug && !editId) {
      setFormSlug(slugify(value));
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) { setFormError('Category name is required.'); return; }
    if (!formSlug.trim()) { setFormError('Slug is required.'); return; }

    setFormSaving(true);
    const payload: Partial<Category> = {
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDesc,
      display_order: parseInt(formOrder) || 0,
      is_active: formActive,
    };

    const res = editId
      ? await api.updateCategory(editId, payload)
      : await api.createCategory(payload);

    setFormSaving(false);

    if (res.success) {
      setShowForm(false);
      loadCategories();
    } else {
      setFormError(res.error || 'Failed to save category');
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const res = await api.deleteCategory(id);
    if (res.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleting(false);
    setDeleteId(null);
  }

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
                <span className="butter-underline">Categories</span>
              </h1>
              <p className="font-sans text-body-sm text-smoke mt-1">{categories.length} categories total</p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Category
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="bg-white border border-ash rounded overflow-hidden">
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-ash/50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded p-5">
              <p className="font-sans text-body-sm text-red-700">{error}</p>
              <button onClick={loadCategories} className="mt-2 font-sans text-label-sm text-red-700 underline">Try again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && categories.length === 0 && (
            <div className="bg-white border border-ash rounded p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-smoke/30 block mb-3">category</span>
              <p className="font-sans text-body-md text-smoke">No categories yet. Create your first category!</p>
              <button onClick={openAddForm} className="mt-4 font-sans text-label-sm text-[#004ac6] underline">Add Category</button>
            </div>
          )}

          {/* Categories List */}
          {!loading && !error && categories.length > 0 && (
            <div className="bg-white border border-ash rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ash">
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Name</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Slug</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Order</th>
                      <th className="text-left font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Status</th>
                      <th className="text-right font-sans text-label-sm text-smoke uppercase tracking-widest px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-ash last:border-0 hover:bg-[#fbf8f6] transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-sans text-body-sm text-ink-black">{cat.name}</p>
                            {cat.description && (
                              <p className="font-sans text-caption text-smoke mt-0.5 line-clamp-1">{cat.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-sans text-body-sm text-smoke">{cat.slug}</td>
                        <td className="px-5 py-3 font-sans text-body-sm text-ink-black">{cat.display_order}</td>
                        <td className="px-5 py-3">
                          <span className={`font-sans text-caption font-medium px-3 py-1 rounded-full ${cat.is_active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openEditForm(cat)} className="font-sans text-label-sm text-[#004ac6] hover:underline">Edit</button>
                            <button onClick={() => setDeleteId(cat.id)} className="font-sans text-label-sm text-red-600 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-ash rounded p-6 max-w-lg mx-4 w-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-title-md text-ink-black">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1">
                <span className="material-symbols-outlined text-ink-black">close</span>
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="font-sans text-body-sm text-red-700">{formError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Name</label>
                <input type="text" value={formName} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Slug</label>
                <input type="text" value={formSlug} onChange={(e) => { setFormSlug(e.target.value); setAutoSlug(false); }} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Display Order</label>
                <input type="number" value={formOrder} onChange={(e) => setFormOrder(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="w-4 h-4 accent-[#004ac6]" />
                <span className="font-sans text-body-sm text-ink-black">Active</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border border-ash rounded font-sans text-label-sm text-ink-black hover:bg-[#f5f5f5]">Cancel</button>
                <button type="submit" disabled={formSaving} className="px-4 py-2 bg-[#004ac6] text-white font-sans text-label-sm rounded hover:bg-[#003b9e] disabled:opacity-50">
                  {formSaving ? 'Saving...' : editId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-ash rounded p-6 max-w-sm mx-4 w-full">
            <h3 className="font-serif text-title-md text-ink-black mb-2">Delete Category</h3>
            <p className="font-sans text-body-sm text-smoke mb-5">Are you sure you want to delete this category?</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteId(null)} disabled={deleting} className="px-4 py-2 bg-white border border-ash rounded font-sans text-label-sm text-ink-black hover:bg-[#f5f5f5]">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="px-4 py-2 bg-red-600 text-white font-sans text-label-sm rounded hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
