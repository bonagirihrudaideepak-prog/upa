import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import { api, getImageUrl } from '../../utils/api';
import type { Category, ProductVariant } from '../../types';

interface VariantEntry {
  color: string;
  color_code: string;
  model: string;
  stock: number;
}

interface ImageEntry {
  file?: File;
  preview: string;
  existing?: string;
  type: 'main' | 'additional';
}

export default function AdminProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('1');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const [variants, setVariants] = useState<VariantEntry[]>([]);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadCategories();
    if (isEdit) loadProduct();
  }, [id, isEdit, navigate]);

  async function loadCategories() {
    const res = await api.getCategories();
    if (res.success && res.data) setCategories(res.data);
  }

  async function loadProduct() {
    if (!id) return;
    setLoading(true);
    const res = await api.getProduct(id);
    if (res.success && res.data) {
      const p = res.data;
      setName(p.name);
      setDescription(p.description || '');
      setPrice(String(p.price));
      setCategory(String(p.category));
      setSku(p.sku || '');
      setStock(String(p.stock));
      setIsFeatured(p.is_featured);
      setIsNewArrival(p.is_new_arrival);
      setIsOutOfStock(p.is_out_of_stock);
      setVariants(
        p.variants?.map((v: ProductVariant) => ({
          color: v.color,
          color_code: v.color_code,
          model: v.model,
          stock: v.stock,
        })) || []
      );
      setImages(
        p.images?.map((img) => ({
          preview: getImageUrl(img.image_path),
          existing: img.image_path,
          type: img.image_type === 'main' ? 'main' : 'additional',
        })) || []
      );
    } else {
      setError(res.error || 'Failed to load product');
    }
    setLoading(false);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newImages: ImageEntry[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        type: images.length === 0 && newImages.length === 0 ? 'main' : 'additional',
      });
    }
    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function addUrlImage() {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setImages((prev) => [
      ...prev,
      {
        preview: url,
        existing: url,
        type: prev.length === 0 ? 'main' : 'additional',
      },
    ]);
    setUrlInput('');
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { color: '', color_code: '#000000', model: '', stock: 0 }]);
  }

  function updateVariant(index: number, field: keyof VariantEntry, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string | null {
    if (!name.trim()) return 'Product name is required.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return 'Valid price is required.';
    if (!category) return 'Category is required.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('sku', sku);
    formData.append('stock', stock);
    formData.append('is_featured', String(isFeatured));
    formData.append('is_new_arrival', String(isNewArrival));
    formData.append('is_out_of_stock', String(isOutOfStock));

    variants.forEach((v, i) => {
      formData.append(`variants[${i}][color]`, v.color);
      formData.append(`variants[${i}][color_code]`, v.color_code);
      formData.append(`variants[${i}][model]`, v.model);
      formData.append(`variants[${i}][stock]`, String(v.stock));
    });

    images.forEach((img) => {
      if (img.file) {
        formData.append('images[]', img.file);
      } else if (img.existing || img.preview) {
        formData.append('image_urls[]', img.existing || img.preview);
      }
    });

    const res = isEdit
      ? await api.updateProduct(Number(id), formData)
      : await api.createProduct(formData);

    setSaving(false);

    if (res.success) {
      setSuccessMsg(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => navigate('/admin/products'), 1500);
    } else {
      setError(res.error || 'Failed to save product');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-paper flex">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-margin md:ml-80 pt-20 md:pt-10">
          <div className="max-w-container mx-auto space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-ash/50 rounded" />
            <div className="bg-white border border-ash rounded p-6 space-y-5">
              <div className="h-6 w-32 bg-ash/50 rounded" />
              <div className="h-10 w-full bg-ash/50 rounded" />
              <div className="h-10 w-full bg-ash/50 rounded" />
              <div className="h-10 w-1/2 bg-ash/50 rounded" />
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

      <main className="flex-1 overflow-y-auto p-gutter md:p-margin md:ml-80 pt-20 md:pt-10 pb-16">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-headline-md text-ink-black">
                <span className="butter-underline">{isEdit ? 'Edit Product' : 'Add Product'}</span>
              </h1>
              <p className="font-sans text-body-sm text-smoke mt-1">
                {isEdit ? 'Update product details' : 'Create a new product'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="font-sans text-label-sm text-smoke hover:text-ink-black transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="font-sans text-body-sm text-red-700">{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="font-sans text-body-sm text-green-700">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Basic Information</h2>

              <div>
                <label htmlFor="pname" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Product Name</label>
                <input id="pname" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
              </div>

              <div>
                <label htmlFor="pdesc" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Description</label>
                <textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6] resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pprice" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Price (₹)</label>
                  <input id="pprice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
                </div>
                <div>
                  <label htmlFor="pcat" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Category</label>
                  <select id="pcat" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]">
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="psku" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">SKU</label>
                  <input id="psku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
                </div>
                <div>
                  <label htmlFor="pstock" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Stock Quantity</label>
                  <input id="pstock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[#004ac6]" />
                  <span className="font-sans text-body-sm text-ink-black">Is Featured</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isNewArrival} onChange={(e) => setIsNewArrival(e.target.checked)} className="w-4 h-4 accent-[#004ac6]" />
                  <span className="font-sans text-body-sm text-ink-black">Is New Arrival</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isOutOfStock} onChange={(e) => setIsOutOfStock(e.target.checked)} className="w-4 h-4 accent-[#004ac6]" />
                  <span className="font-sans text-body-sm text-ink-black">Is Out of Stock</span>
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white border border-ash rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-title-md text-ink-black">Variants &amp; Color Swatches</h2>
                <button type="button" onClick={addVariant} className="font-sans text-label-sm text-[#004ac6] hover:underline flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-lg">add</span> Add Variant
                </button>
              </div>
              {variants.length === 0 && (
                <p className="font-sans text-body-sm text-smoke">No variants added yet.</p>
              )}
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-3 border border-ash rounded bg-[#fbf8f6]">
                  <div>
                    <label className="font-sans text-caption text-smoke block mb-1">Color Name</label>
                    <input type="text" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Titanium Gray" className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <div>
                    <label className="font-sans text-caption text-smoke block mb-1">Color Code</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={v.color_code} onChange={(e) => updateVariant(i, 'color_code', e.target.value)} className="w-8 h-8 p-0 border border-ash rounded cursor-pointer shrink-0" />
                      <input type="text" value={v.color_code} onChange={(e) => updateVariant(i, 'color_code', e.target.value)} className="flex-1 px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                    </div>
                  </div>
                  <div>
                    <label className="font-sans text-caption text-smoke block mb-1">Model / Specs</label>
                    <input type="text" value={v.model} onChange={(e) => updateVariant(i, 'model', e.target.value)} placeholder="e.g. 256GB" className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <div>
                    <label className="font-sans text-caption text-smoke block mb-1">Stock</label>
                    <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="font-sans text-label-sm text-red-600 hover:underline py-2">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="bg-white border border-ash rounded p-5 space-y-4">
              <div>
                <h2 className="font-serif text-title-md text-ink-black mb-1">Product Images</h2>
                <p className="font-sans text-caption text-smoke">Upload files from your device OR paste image Web URLs</p>
              </div>

              {/* Paste URL Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste image web URL (e.g. https://images.unsplash.com/...)"
                  className="flex-1 px-3.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]"
                />
                <button
                  type="button"
                  onClick={addUrlImage}
                  className="px-4 py-2 bg-ink-black text-white font-sans text-label-sm rounded hover:bg-smoke transition-colors uppercase tracking-wider"
                >
                  Add URL
                </button>
              </div>

              {/* Image Previews & Upload Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square border border-ash rounded overflow-hidden bg-ash/20 group">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1">
                      <span className="font-sans text-[10px] bg-white/90 text-ink-black px-2 py-0.5 rounded font-bold shadow-sm">
                        {i === 0 ? 'MAIN' : 'ALT'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/70 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-ash rounded flex flex-col items-center justify-center gap-1.5 text-smoke hover:border-[#004ac6] hover:text-[#004ac6] transition-colors bg-[#fbf8f6]"
                >
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  <span className="font-sans text-caption font-semibold">Browse File</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] disabled:opacity-50 transition-colors shadow-md"
              >
                {saving ? 'Saving Product...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="px-6 py-3 bg-white border border-ash text-ink-black font-sans text-label-sm rounded hover:bg-[#f5f5f5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
