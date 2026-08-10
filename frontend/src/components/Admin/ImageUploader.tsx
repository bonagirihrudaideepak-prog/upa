import React, { useState, useRef } from 'react';

export interface UploadedImageItem {
  id?: number | string;
  preview: string;
  file?: File;
  existing?: boolean;
}

interface ImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
}

export default function ImageUploader({
  images,
  onChange,
  multiple = true,
  maxSizeMB = 5,
  label = 'Product & Category Images',
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'drag' | 'url'>('browse');
  const [urlInput, setUrlInput] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function showSuccess(msg: string = 'Image uploaded successfully!') {
    setSuccessMsg(msg);
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function showError(msg: string) {
    setErrorMsg(msg);
    setSuccessMsg(null);
  }

  function validateAndProcessFiles(filesList: FileList | File[]) {
    setErrorMsg(null);
    const validFiles: File[] = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];

      // Check size (5MB max)
      if (file.size > maxSizeMB * 1024 * 1024) {
        showError(`Error: Image "${file.name}" exceeds the maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }

      // Check format
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        showError('Error: Only JPG, PNG, and WebP images are supported.');
        return;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newItems: UploadedImageItem[] = validFiles.map((file) => ({
      preview: URL.createObjectURL(file),
      file: file,
      existing: false,
    }));

    if (multiple) {
      onChange([...images, ...newItems]);
    } else {
      onChange([newItems[0]]);
    }

    showSuccess();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFiles(e.dataTransfer.files);
    }
  }

  function handleFetchUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      showError('Please enter a valid image URL.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      showError('Error: Unable to fetch image from the provided URL. Please check the link or upload the file directly.');
      return;
    }

    setFetchingUrl(true);
    setErrorMsg(null);

    const img = new Image();
    img.onload = () => {
      setFetchingUrl(false);
      const newItem: UploadedImageItem = {
        preview: trimmed,
        existing: true,
      };

      if (multiple) {
        onChange([...images, newItem]);
      } else {
        onChange([newItem]);
      }
      setUrlInput('');
      showSuccess('Image URL added successfully!');
    };

    img.onerror = () => {
      setFetchingUrl(false);
      showError('Error: Unable to fetch image from the provided URL. Please check the link or upload the file directly.');
    };

    img.src = trimmed;
  }

  function handleRemove(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  }

  function handleSetMain(index: number) {
    if (index === 0 || index >= images.length) return;
    const item = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([item, ...rest]);
    showSuccess('Primary thumbnail updated!');
  }

  return (
    <div className="space-y-4 border border-ash/80 rounded-xl p-4 bg-white shadow-2xs">
      <div className="flex items-center justify-between">
        <label className="block font-sans text-label-sm font-bold uppercase tracking-wider text-ink-black">
          {label}
        </label>
        <span className="text-[11px] text-smoke font-medium">
          {multiple ? 'Multiple images allowed' : 'Single image upload'} (Max {maxSizeMB}MB)
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ash text-body-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'browse'
              ? 'border-[#004ac6] text-[#004ac6] font-semibold'
              : 'border-transparent text-smoke hover:text-ink-black'
          }`}
        >
          <span className="material-symbols-outlined text-lg">folder_open</span>
          Browse File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('drag')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'drag'
              ? 'border-[#004ac6] text-[#004ac6] font-semibold'
              : 'border-transparent text-smoke hover:text-ink-black'
          }`}
        >
          <span className="material-symbols-outlined text-lg">drag_pan</span>
          Drag & Drop
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'url'
              ? 'border-[#004ac6] text-[#004ac6] font-semibold'
              : 'border-transparent text-smoke hover:text-ink-black'
          }`}
        >
          <span className="material-symbols-outlined text-lg">link</span>
          External URL
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'browse' && (
          <div className="py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
              id="system-file-input"
            />
            <label
              htmlFor="system-file-input"
              className="inline-flex items-center gap-2 bg-[#004ac6] text-white font-sans text-label-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-[#003bb0] transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
              Choose Image File{multiple ? 's' : ''}
            </label>
            <p className="text-[12px] text-smoke mt-2">
              Supports PNG, JPG, WebP, GIF up to {maxSizeMB}MB.
            </p>
          </div>
        )}

        {activeTab === 'drag' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? 'border-[#004ac6] bg-[#f0f4ff]' : 'border-ash hover:border-smoke bg-cream-paper/30'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-[#004ac6] mb-2 block">cloud_upload</span>
            <p className="font-sans text-body-sm font-semibold text-ink-black">
              Drag & Drop your image{multiple ? 's' : ''} here
            </p>
            <p className="text-[12px] text-smoke mt-1">or drop files directly from your computer desktop</p>
          </div>
        )}

        {activeTab === 'url' && (
          <div className="flex gap-2 py-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 border border-ash rounded-lg px-3.5 py-2 font-body-sm text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
            />
            <button
              type="button"
              onClick={handleFetchUrl}
              disabled={fetchingUrl}
              className="inline-flex items-center gap-1.5 bg-ink-black text-white font-sans text-label-sm font-semibold px-4 py-2 rounded-lg hover:bg-smoke transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              {fetchingUrl ? 'Fetching...' : 'Fetch Image'}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-body-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-red-600">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-body-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-green-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Image Gallery / Previews */}
      {images.length > 0 && (
        <div className="pt-2 border-t border-ash/60">
          <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-smoke mb-3">
            Assigned Image Preview ({images.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((item, index) => (
              <div
                key={index}
                className={`group relative aspect-square border rounded-lg overflow-hidden bg-cream-paper p-1 flex items-center justify-center ${
                  index === 0 ? 'border-[#004ac6] ring-2 ring-[#004ac6]/20' : 'border-ash'
                }`}
              >
                <img
                  src={item.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-contain mix-blend-multiply rounded"
                />

                {/* Primary Badge */}
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-[#004ac6] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    Main
                  </span>
                )}

                {/* Control Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                  {multiple && index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(index)}
                      className="bg-white text-ink-black p-1.5 rounded-full hover:bg-butter-highlight transition-colors shadow-sm"
                      title="Set as Primary Image"
                    >
                      <span className="material-symbols-outlined text-sm block">star</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors shadow-sm"
                    title="Remove Image"
                  >
                    <span className="material-symbols-outlined text-sm block">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
