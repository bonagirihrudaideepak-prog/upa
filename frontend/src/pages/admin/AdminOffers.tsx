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
  
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPreview, setFormPreview] = useState('');
  const [imageMode, setImageMode] = useState<'file' | 'url'>('file');

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
    setFormImageFile(null);
    setFormImageUrl('');
    setFormPreview('');
    setFormError('');
    setImageMode('file');
    setShowForm(true);
  }

  function openEditForm(offer: Offer) {
    setEditId(offer.id);
    setFormTitle(offer.title || '');
    setFormDesc(offer.description || '');
    setFormLink(offer.link || '');
    setFormActive(offer.is_active);
    setFormImageFile(null);
    setFormImageUrl(offer.image_path || '');
    setFormPreview(offer.image_path ? getImageUrl(offer.image_path) : '');
    setFormError('');
    setImageMode(offer.image_path?.startsWith('http') ? 'url' : 'file');
    setShowForm(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFormImageFile(file);
      setFormPreview(URL.createObjectURL(file));
    }
  }

  function handleUrlChange(val: string) {
    setFormImageUrl(val);
    if (val.trim()) {
      setFormPreview(val.trim());
    } else {
      setFormPreview('');
    }
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) { setFormError('Title is required.'); return; }

    setFormSaving(true);
    let finalImagePath = formImageUrl.trim();

    // 1. If a local file was chosen, upload it to the server first
    if (imageMode === 'file' && formImageFile) {
      const formData = new FormData();
      formData.append('file', formImageFile);
      const uploadRes = await api.uploadImage(formData);
      if (uploadRes.success && uploadRes.data?.path) {
        finalImagePath = uploadRes.data.path;
      } else {
        setFormError(uploadRes.error || 'Failed to upload image. Please check authentication and try again.');
        setFormSaving(false);
        return;
      }
    }

    // 2. Submit offer payload with final image_path
    const payload: Partial<Offer> = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      image_path: finalImagePath || null,
      link: formLink.trim(),
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
      if (res.error?.toLowerCase().includes('not found')) {
        setShowForm(false);
        loadOffers();
      } else {
        setFormError(res.error || 'Failed to save offer');
      }
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    const res = await api.deleteOffer(id);
    setDeleting(false);
    setDeleteId(null);
    loadOffers();
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
                <span className="butter-underline">Banners & Offers</span>
              </h1>
              <p className="font-sans text-body-sm text-smoke mt-1">
                Manage promotional banners displayed on the homepage & website header ({offers.length} total)
              </p>
            </div>
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Banner / Offer
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
              <span className="material-symbols-outlined text-5xl text-smoke/30 block mb-3">campaign</span>
              <p className="font-sans text-body-md text-smoke">No offers or banners added yet.</p>
              <button onClick={openAddForm} className="mt-4 font-sans text-label-sm text-[#004ac6] underline">Add First Banner</button>
            </div>
          )}

          {/* Offers Grid */}
          {!loading && !error && offers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map((offer) => {
                const imgUrl = offer.image_path ? getImageUrl(offer.image_path) : '';
                return (
                  <div key={offer.id} className="bg-white border border-ash rounded overflow-hidden flex flex-col group">
                    <div className="aspect-video bg-ash/20 overflow-hidden relative">
                      {imgUrl ? (
                        <img src={imgUrl} alt={offer.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-smoke/40">
                          <span className="material-symbols-outlined text-4xl mb-1">image_not_supported</span>
                          <span className="font-sans text-caption">No image</span>
                        </div>
                      )}
                      <span className={`absolute top-3 right-3 font-sans text-caption font-medium px-2.5 py-1 rounded-full shadow-sm ${offer.is_active ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'}`}>
                        {offer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-title-md text-ink-black truncate">{offer.title}</h3>
                        {offer.description && (
                          <p className="font-sans text-body-sm text-smoke line-clamp-2 mt-1">{offer.description}</p>
                        )}
                        {offer.link && (
                          <p className="font-sans text-caption text-[#004ac6] truncate mt-2">🔗 {offer.link}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-ash">
                        <button onClick={() => openEditForm(offer)} className="font-sans text-label-sm text-[#004ac6] hover:underline">Edit</button>
                        <button onClick={() => setDeleteId(offer.id)} className="font-sans text-label-sm text-red-600 hover:underline">Delete</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Banner Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-ash rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-5 border-b border-ash pb-3">
              <h2 className="font-serif text-headline-sm text-ink-black">{editId ? 'Edit Banner / Offer' : 'Add Banner / Offer'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-ash/20 rounded-full transition-colors">
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
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Banner Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Mega Sale - Up to 50% Off Accessories"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  required
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief description of the offer or promotion..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>

              {/* Image Input Section with Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest">Banner Image</label>
                  <div className="flex gap-2 text-caption font-sans">
                    <button
                      type="button"
                      onClick={() => setImageMode('file')}
                      className={`px-2.5 py-1 rounded transition-colors ${imageMode === 'file' ? 'bg-[#004ac6] text-white font-medium' : 'bg-ash/40 text-smoke'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2.5 py-1 rounded transition-colors ${imageMode === 'url' ? 'bg-[#004ac6] text-white font-medium' : 'bg-ash/40 text-smoke'}`}
                    >
                      Web Image URL
                    </button>
                  </div>
                </div>

                {/* Preview Box */}
                {formPreview ? (
                  <div className="relative mb-3 aspect-video rounded-lg overflow-hidden border border-ash bg-ash/20">
                    <img src={formPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFormImageFile(null); setFormImageUrl(''); setFormPreview(''); }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black"
                      title="Remove image"
                    >
                      <span className="material-symbols-outlined text-sm block">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 aspect-video rounded-lg border-2 border-dashed border-ash flex flex-col items-center justify-center text-smoke/50 bg-ash/10">
                    <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
                    <span className="font-sans text-caption">No image selected</span>
                  </div>
                )}

                {imageMode === 'file' ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full font-sans text-body-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-label-sm file:bg-[#004ac6]/10 file:text-[#004ac6] hover:file:bg-[#004ac6]/20 cursor-pointer"
                  />
                ) : (
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://images.unsplash.com/... or image link"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                )}
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Target Link (Optional)</label>
                <input
                  type="text"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  placeholder="/catalog or /product/1 or WhatsApp link"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="w-4 h-4 accent-[#004ac6]"
                />
                <span className="font-sans text-body-sm font-medium text-ink-black">Active (Display on Homepage)</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-ash">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 bg-white border border-ash rounded font-sans text-label-sm text-ink-black hover:bg-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2.5 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] disabled:opacity-50 transition-colors"
                >
                  {formSaving ? 'Saving Banner...' : editId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-ash rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-title-md text-ink-black mb-2">Delete Banner</h3>
            <p className="font-sans text-body-sm text-smoke mb-5">Are you sure you want to delete this promotional banner?</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 bg-white border border-ash rounded font-sans text-label-sm text-ink-black hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white font-sans text-label-sm rounded hover:bg-red-700 disabled:opacity-50"
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
