import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import ImageUploader, { UploadedImageItem } from '../../components/Admin/ImageUploader';
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

const PRESET_COLORS = [
  { name: 'Natural Titanium', code: '#bebaa7' },
  { name: 'Deep Blue', code: '#2c3e50' },
  { name: 'Titanium Gray', code: '#708090' },
  { name: 'Titanium Black', code: '#1c1c1c' },
  { name: 'Midnight Black', code: '#000000' },
  { name: 'Saddle Brown', code: '#8B4513' },
  { name: 'Glossy White', code: '#FFFFFF' },
  { name: 'Ocean Orange', code: '#FF6F00' },
  { name: 'Rose Gold', code: '#B76E79' },
  { name: 'Emerald Green', code: '#00875A' },
  { name: 'Royal Violet', code: '#6B46C1' },
];

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
  const [likesCount, setLikesCount] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const [variants, setVariants] = useState<VariantEntry[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [modelInput, setModelInput] = useState('');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [customPresets, setCustomPresets] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadCategories();
    loadSettings();
    if (isEdit) loadProduct();
  }, [id, isEdit, navigate]);

  async function loadCategories() {
    const res = await api.getCategories();
    if (res.success && res.data) setCategories(res.data);
  }

  async function loadSettings() {
    const res = await api.getSettings();
    if (res.success && res.data && res.data.custom_phone_models) {
      const raw = res.data.custom_phone_models;
      const parsed = raw.split(/[,\n]/).map((m: string) => m.trim()).filter(Boolean);
      setCustomPresets(parsed);
    }
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
      setLikesCount(String(p.likes_count ?? 0));
      setIsFeatured(p.is_featured);
      setIsNewArrival(p.is_new_arrival);
      setIsOutOfStock(p.is_out_of_stock);
      setModels(Array.isArray(p.models) ? p.models : []);
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

  function addVariant(colorName = 'Midnight Black', colorCode = '#000000') {
    setVariants((prev) => [...prev, { color: colorName, color_code: colorCode, model: '', stock: 10 }]);
  }

  function updateVariant(index: number, field: keyof VariantEntry, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function addModel() {
    const value = modelInput.trim();
    if (!value) return;
    const split = value.split(',').map((m) => m.trim()).filter(Boolean);
    setModels((prev) => Array.from(new Set([...prev, ...split])));
    setModelInput('');
  }

  function removeModel(index: number) {
    setModels((prev) => prev.filter((_, i) => i !== index));
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
    formData.append('likes_count', likesCount);
    formData.append('is_featured', String(isFeatured));
    formData.append('is_new_arrival', String(isNewArrival));
    formData.append('is_out_of_stock', String(isOutOfStock));
    formData.append('models', JSON.stringify(models));

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

  return (
    <div className="min-h-screen bg-cream-paper flex">
      <AdminSidebar />
      <AdminMobileHeader />

      <main className="flex-1 overflow-y-auto p-gutter md:p-margin md:ml-80 pt-20 md:pt-10">
        <div className="max-w-container mx-auto space-y-6">
          <div className={loading ? 'space-y-6 animate-pulse block' : 'hidden'}>
            <div className="h-8 w-48 bg-ash/50 rounded" />
            <div className="bg-white border border-ash rounded p-6 space-y-5">
              <div className="h-10 w-full bg-ash/50 rounded" />
              <div className="h-10 w-full bg-ash/50 rounded" />
            </div>
          </div>

          <div className={loading ? 'hidden' : 'space-y-6'}>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="psku" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">SKU</label>
                  <input id="psku" type="text" value={sku} onChange={(e) => setSku(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
                </div>
                <div>
                  <label htmlFor="pstock" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Stock Quantity</label>
                  <input id="pstock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
                </div>
                <div>
                  <label htmlFor="plikes" className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">Initial Likes Count</label>
                  <input id="plikes" type="number" min="0" value={likesCount} onChange={(e) => setLikesCount(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black placeholder:text-smoke/50 focus:outline-none focus:border-[#004ac6]" />
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

            {/* Color Palette & Variants */}
            <div className="bg-white border border-ash rounded p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-title-md text-ink-black">Color Swatches &amp; Model Variants</h2>
                  <p className="font-sans text-caption text-smoke">Click a color palette swatch below to add a color variant easily!</p>
                </div>
                <button type="button" onClick={() => addVariant()} className="font-sans text-label-sm text-[#004ac6] hover:underline flex items-center gap-1 font-semibold shrink-0">
                  <span className="material-symbols-outlined text-lg">add</span> Add Custom Variant
                </button>
              </div>

              {/* Visual Color Palette Swatches */}
              <div className="p-3 bg-[#fbf8f6] border border-ash rounded space-y-2">
                <span className="font-sans text-caption font-bold text-smoke uppercase tracking-wider block">Quick Color Palette Picker:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => addVariant(preset.name, preset.code)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white border border-ash hover:border-ink-black rounded-full font-sans text-caption text-ink-black transition-all shadow-sm"
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-ash/80 inline-block shrink-0" style={{ backgroundColor: preset.code }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {variants.length === 0 && (
                <p className="font-sans text-body-sm text-smoke italic">No variants added yet. Select a color above to add one.</p>
              )}

              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end p-3.5 border border-ash rounded bg-white shadow-sm">
                  <div>
                    <label className="font-sans text-caption font-semibold text-smoke block mb-1">Color Name</label>
                    <input type="text" value={v.color} onChange={(e) => updateVariant(i, 'color', e.target.value)} placeholder="e.g. Natural Titanium" className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <div>
                    <label className="font-sans text-caption font-semibold text-smoke block mb-1">Visual Palette Swatch</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={v.color_code} onChange={(e) => updateVariant(i, 'color_code', e.target.value)} className="w-9 h-9 p-0.5 border border-ash rounded-full cursor-pointer shrink-0" title="Click to pick swatch" />
                      <span className="w-6 h-6 rounded-full border border-ash inline-block" style={{ backgroundColor: v.color_code }} />
                    </div>
                  </div>
                  <div>
                    <label className="font-sans text-caption font-semibold text-smoke block mb-1">Model / Specs</label>
                    <input type="text" value={v.model} onChange={(e) => updateVariant(i, 'model', e.target.value)} placeholder="e.g. 256GB / Pro" className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <div>
                    <label className="font-sans text-caption font-semibold text-smoke block mb-1">Stock</label>
                    <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className="w-full px-2.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]" />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="font-sans text-label-sm text-red-600 hover:underline py-2">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Product Models (dropdown options) */}
            <div className="bg-white border border-ash rounded p-5 space-y-4">
              <div>
                <h2 className="font-serif text-title-md text-ink-black mb-1">Product Models</h2>
                <p className="font-sans text-caption text-smoke">
                  Select popular phone model presets or type custom model names. These appear in the "Select Model" dropdown on the product detail page.
                </p>
              </div>

              {/* Model Presets Quick Dropdown */}
              <div className="bg-[#f0f4ff] border border-[#d0e0ff] rounded-xl p-3.5 space-y-2">
                <label className="font-sans text-caption font-bold text-[#004ac6] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">smartphone</span>
                  Quick Add Popular Phone Models
                </label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      if (!models.includes(val)) {
                        setModels((prev) => [...prev, val]);
                      }
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                >
                  <option value="">-- Choose a Preset Phone Model to Add --</option>
                  <optgroup label="🍎 Apple iPhone Series">
                    <option value="iPhone 17 Pro Max">iPhone 17 Pro Max</option>
                    <option value="iPhone 17 Pro">iPhone 17 Pro</option>
                    <option value="iPhone 17">iPhone 17</option>
                    <option value="iPhone 17 Plus">iPhone 17 Plus</option>
                    <option value="iPhone 16 Pro Max">iPhone 16 Pro Max</option>
                    <option value="iPhone 16 Pro">iPhone 16 Pro</option>
                    <option value="iPhone 16">iPhone 16</option>
                    <option value="iPhone 15 Pro Max">iPhone 15 Pro Max</option>
                    <option value="iPhone 15 Pro">iPhone 15 Pro</option>
                    <option value="iPhone 15">iPhone 15</option>
                    <option value="iPhone 14 Pro Max">iPhone 14 Pro Max</option>
                    <option value="iPhone 14">iPhone 14</option>
                    <option value="iPhone 13">iPhone 13</option>
                  </optgroup>
                  <optgroup label="📱 Samsung Galaxy Series">
                    <option value="Samsung Galaxy S25 Ultra">Samsung Galaxy S25 Ultra</option>
                    <option value="Samsung Galaxy S25+">Samsung Galaxy S25+</option>
                    <option value="Samsung Galaxy S25">Samsung Galaxy S25</option>
                    <option value="Samsung Galaxy S24 Ultra">Samsung Galaxy S24 Ultra</option>
                    <option value="Samsung Galaxy S24+">Samsung Galaxy S24+</option>
                    <option value="Samsung Galaxy S24">Samsung Galaxy S24</option>
                    <option value="Samsung Galaxy S23 Ultra">Samsung Galaxy S23 Ultra</option>
                  </optgroup>
                  <optgroup label="⚡ OnePlus & Other Brands">
                    <option value="OnePlus 13">OnePlus 13</option>
                    <option value="OnePlus 13R">OnePlus 13R</option>
                    <option value="OnePlus 12">OnePlus 12</option>
                    <option value="OnePlus 12R">OnePlus 12R</option>
                    <option value="OnePlus Nord 4">OnePlus Nord 4</option>
                    <option value="Xiaomi 15 Pro">Xiaomi 15 Pro</option>
                    <option value="Realme GT 7 Pro">Realme GT 7 Pro</option>
                  </optgroup>
                  {customPresets.length > 0 && (
                    <optgroup label="⚙️ Custom Admin Presets">
                      {customPresets.map((preset) => (
                        <option key={preset} value={preset}>{preset}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addModel(); } }}
                  placeholder="Or type custom model name (e.g. iPhone 17 Pro Max)..."
                  className="flex-1 px-3.5 py-2 border border-ash rounded font-sans text-body-sm focus:outline-none focus:border-[#004ac6]"
                />
                <button
                  type="button"
                  onClick={addModel}
                  className="px-4 py-2 bg-ink-black text-white font-sans text-label-sm rounded hover:bg-smoke transition-colors uppercase tracking-wider"
                >
                  Add Custom
                </button>
              </div>

              {models.length === 0 ? (
                <p className="font-sans text-body-sm text-smoke italic">No models added yet. Add one above.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {models.map((m, i) => (
                    <li key={i} className="flex items-center gap-1.5 bg-[#fbf8f6] border border-ash rounded-full pl-3 pr-1.5 py-1">
                      <span className="font-sans text-body-sm text-ink-black">{m}</span>
                      <button
                        type="button"
                        onClick={() => removeModel(i)}
                        className="w-5 h-5 rounded-full bg-white border border-ash text-smoke hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-colors"
                        aria-label={`Remove model ${m}`}
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Images */}
            {/* Images Uploader (Browse, Drag & Drop, External URL) */}
            <ImageUploader
              label="Product Images"
              multiple={true}
              maxSizeMB={5}
              images={images.map((img) => ({
                preview: img.preview,
                file: img.file,
                existing: Boolean(img.existing),
              }))}
              onChange={(uploaded) => {
                const newEntries: ImageEntry[] = uploaded.map((item, idx) => ({
                  file: item.file,
                  preview: item.preview,
                  existing: item.existing ? item.preview : undefined,
                  type: idx === 0 ? 'main' : 'additional',
                }));
                setImages(newEntries);
              }}
            />

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
        </div>
      </main>
    </div>
  );
}
