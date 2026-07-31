import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import { api, getImageUrl } from '../../utils/api';
import type { Offer } from '../../types';

export default function AdminOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadOffers();
  }, [navigate]);

  async function loadOffers() {
    setLoading(true);
    setError('');
    const res = await api.getAdminOffers();
    if (res.success && res.data) {
      setOffers(res.data);
    } else {
      setError(res.error || 'Failed to load offers');
    }
    setLoading(false);
  }

  function openAddForm() {
    setEditId(null);
    setFormTitle('');
    setFormDesc('');
    setFormLink('');
    setFormActive(true);
    setFormImage(null);
    setFormPreview('');
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(offer: Offer) {
    setEditId(offer.id);
    setFormTitle(offer.title);
    setFormDesc(offer.description);
    setFormLink(offer.link);
    setFormActive(offer.is_active);
    setFormImage(null);
    setFormPreview(offer.image_path ? getImageUrl(offer.image_path) : '');
    setFormError('');
    setShowForm(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      setFormPreview(URL.createObjectURL(file));
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) { setFormError('Title is required.'); return; }

    setFormSaving(true);
    const payload: Partial<Offer> = {
      title: formTitle.trim(),
      description: formDesc,
      link: formLink,
      is_active: formActive,
    };

    const res = editId
      ? await api.updateOffer(editId, payload)
      : await api.createOffer(payload);

    setFormSaving(false);

    if (res.success) {
      setShowForm(false);
      loadOffers();
    } else {
      setFormError(res.error || 'Failed to save offer');
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const res = await api.deleteOffer(id);
    if (res.success) {
      setOffers((prev) => prev.filter((o) => o.id !== id));
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
                <span className="butter-underline">Offers</span>
              </h1>
              <p className="font-sans text-body-sm text-smoke mt-1">{offers.length} offers total</p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Offer
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-ash rounded overflow-hidden animate-pulse">
                  <div className="aspect-video bg-ash/50" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-3/4 bg-ash/50 rounded" />
                    <div className="h-4 w-1/2 bg-ash/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded p-5">
              <p className="font-sans text-body-sm text-red-700">{error}</p>
              <button onClick={loadOffers} className="mt-2 font-sans text-label-sm text-red-700 underline">Try again</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && offers.length === 0 && (
            <div className="bg-white border border-ash rounded p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-smoke/30 block mb-3">local_offer</span>
              <p className="font-sans text-body-md text-smoke">No offers yet. Create your first offer!</p>
              <button onClick={openAddForm} className="mt-4 font-sans text-label-sm text-[#004ac6] underline">Add Offer</button>
            </div>
          )}

          {/* Offers Grid */}
          {!loading && !error && offers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((offer) => (
                <div key={offer.id} className="bg-white border border-ash rounded overflow-hidden group">
                  <div className="aspect-video bg-ash/20 overflow-hidden">
                    {offer.image_path ? (
                      <img src={getImageUrl(offer.image_path)} alt={offer.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-smoke/30">image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif text-title-md text-ink-black truncate">{offer.title}</h3>
                      <span className={`font-sans text-caption font-medium px-2 py-0.5 rounded-full ${offer.is_active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {offer.description && (
                      <p className="font-sans text-body-sm text-smoke line-clamp-2 mt-1">{offer.description}</p>
                    )}
                    <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-ash">
                      <button onClick={() => openEditForm(offer)} className="font-sans text-label-sm text-[#004ac6] hover:underline">Edit</button>
                      <button onClick={() => setDeleteId(offer.id)} className="font-sans text-label-sm text-red-600 hover:underline">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white border border-ash rounded p-6 max-w-lg mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-title-md text-ink-black">{editId ? 'Edit Offer' : 'Add Offer'}</h2>
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
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Title</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Image</label>
                {formPreview && (
                  <div className="mb-2 aspect-video rounded overflow-hidden border border-ash">
                    <img src={formPreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full font-sans text-body-sm" />
              </div>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Link</label>
                <input type="text" value={formLink} onChange={(e) => setFormLink(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]" />
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
            <h3 className="font-serif text-title-md text-ink-black mb-2">Delete Offer</h3>
            <p className="font-sans text-body-sm text-smoke mb-5">Are you sure you want to delete this offer?</p>
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
