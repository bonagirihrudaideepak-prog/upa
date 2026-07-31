import { useState } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useApp } from '../context/AppContext';

interface FormData {
  name: string;
  phone: string;
  deviceModel: string;
  colorPreference: string;
  description: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  phone: '',
  deviceModel: '',
  colorPreference: '',
  description: '',
};

export default function CustomizationPage() {
  const { whatsappNumber, showToast } = useApp();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid phone number';
    if (!form.deviceModel.trim()) errs.deviceModel = 'Device model is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const message = [
      `Hi, I'm interested in a custom cover/personalization.`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Device Model: ${form.deviceModel.trim()}`,
      form.colorPreference.trim() ? `Color Preference: ${form.colorPreference.trim()}` : '',
      form.description.trim() ? `Description: ${form.description.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const num = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    setForm(INITIAL_FORM);
    setSubmitting(false);
    showToast('Inquiry sent via WhatsApp!', 'success');
  }

  function inputClasses(field: keyof FormData): string {
    const base = 'w-full border rounded px-3 py-2 font-body-md text-body-md text-ink-black bg-white focus:outline-none transition-colors';
    return errors[field]
      ? `${base} border-red-400 focus:border-red-500`
      : `${base} border-ash focus:border-ink-black`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-paper">
      <Header />

      <main className="flex-1 w-full pt-20 md:pt-24 pb-12">
        <div className="max-w-container mx-auto px-gutter">
          <div className="max-w-lg mx-auto">
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="font-headline-md text-headline-md text-ink-black butter-underline">
                Custom Covers &amp; Personalization
              </h1>
              <p className="font-body-md text-body-md text-smoke mt-4 leading-relaxed">
                Want a unique cover or personalized device? Tell us your device model, color preference, 
                and any design ideas. We'll get back to you on WhatsApp with pricing and availability.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Name */}
              <div>
                <label
                  htmlFor="cust-name"
                  className="block font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-1.5"
                >
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="cust-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  className={inputClasses('name')}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'cust-name-error' : undefined}
                />
                {errors.name && (
                  <p id="cust-name-error" className="font-caption text-caption text-red-500 mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="cust-phone"
                  className="block font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-1.5"
                >
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClasses('phone')}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'cust-phone-error' : undefined}
                />
                {errors.phone && (
                  <p id="cust-phone-error" className="font-caption text-caption text-red-500 mt-1" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Device Model */}
              <div>
                <label
                  htmlFor="cust-device"
                  className="block font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-1.5"
                >
                  Device Model <span className="text-red-400">*</span>
                </label>
                <input
                  id="cust-device"
                  type="text"
                  value={form.deviceModel}
                  onChange={(e) => handleChange('deviceModel', e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max"
                  className={inputClasses('deviceModel')}
                  aria-invalid={!!errors.deviceModel}
                  aria-describedby={errors.deviceModel ? 'cust-device-error' : undefined}
                />
                {errors.deviceModel && (
                  <p id="cust-device-error" className="font-caption text-caption text-red-500 mt-1" role="alert">
                    {errors.deviceModel}
                  </p>
                )}
              </div>

              {/* Color Preference */}
              <div>
                <label
                  htmlFor="cust-color"
                  className="block font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-1.5"
                >
                  Color Preference
                </label>
                <input
                  id="cust-color"
                  type="text"
                  value={form.colorPreference}
                  onChange={(e) => handleChange('colorPreference', e.target.value)}
                  placeholder="e.g. Matte Black, Rose Gold"
                  className={inputClasses('colorPreference')}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="cust-desc"
                  className="block font-label-sm text-label-sm text-smoke uppercase tracking-wider mb-1.5"
                >
                  Design Description
                </label>
                <textarea
                  id="cust-desc"
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe your design idea, any reference images, text to engrave, etc."
                  rows={4}
                  className={`${inputClasses('description')} resize-y min-h-[100px]`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ink-black text-white font-label-sm text-label-sm px-6 py-3 rounded uppercase hover:bg-smoke transition-colors tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Opening WhatsApp...' : 'Send Inquiry via WhatsApp'}
              </button>

              <p className="font-caption text-caption text-smoke text-center">
                We'll reach out on WhatsApp within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
