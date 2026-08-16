import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminMobileHeader from '../../components/Admin/AdminMobileHeader';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { reloadSettings } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [storeName, setStoreName] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  const [locationMapUrl, setLocationMapUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [customPhoneModels, setCustomPhoneModels] = useState('');
  const [footerTagline, setFooterTagline] = useState('');
  const [pickupNotice, setPickupNotice] = useState('');
  const [pickupLabel, setPickupLabel] = useState('');
  const [searchPlaceholder, setSearchPlaceholder] = useState('');
  const [chatGreeting, setChatGreeting] = useState('');
  const [contactWhatsAppMessage, setContactWhatsAppMessage] = useState('');
  const [homeCategoriesTitle, setHomeCategoriesTitle] = useState('');
  const [homeFeaturedTitle, setHomeFeaturedTitle] = useState('');
  const [homeNewArrivalsTitle, setHomeNewArrivalsTitle] = useState('');
  const [homeAllProductsTitle, setHomeAllProductsTitle] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin'); return; }
    loadSettings();
  }, [navigate]);

  async function loadSettings() {
    setLoading(true);
    setError('');
    const res = await api.getSettings();
    if (res.success && res.data) {
      const s = res.data;
      setStoreName(s.store_name || 'Upanishad mobiles');
      setMarqueeText(s.marquee_text || '');
      setContactPhone(s.contact_phone || '');
      setWhatsappNumber(s.whatsapp_number || '');
      setInstagramUrl(s.instagram_url || '');
      setFacebookUrl(s.facebook_url || '');
      setYoutubeUrl(s.youtube_url || '');
      setStoreAddress(s.store_address || '');
      setContactEmail(s.contact_email || '');
      setAboutContent(s.about_content || '');
      setLocationMapUrl(s.location_map_url || '');
      setHeroTitle(s.hero_title || '');
      setHeroSubtitle(s.hero_subtitle || '');
      setSeoKeywords(s.seo_keywords || '');
      setCustomPhoneModels(s.custom_phone_models || '');
      setFooterTagline(s.footer_tagline || '');
      setPickupNotice(s.pickup_notice || '');
      setPickupLabel(s.pickup_label || '');
      setSearchPlaceholder(s.search_placeholder || '');
      setChatGreeting(s.chat_greeting || '');
      setContactWhatsAppMessage(s.contact_whatsapp_message || '');
      setHomeCategoriesTitle(s.home_categories_title || '');
      setHomeFeaturedTitle(s.home_featured_title || '');
      setHomeNewArrivalsTitle(s.home_new_arrivals_title || '');
      setHomeAllProductsTitle(s.home_all_products_title || '');
      setFooterCopyright(s.footer_copyright || '');
    } else {
      setError(res.error || 'Failed to load site settings');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    const payload = {
      store_name: storeName.trim(),
      marquee_text: marqueeText.trim(),
      contact_phone: contactPhone.trim(),
      whatsapp_number: whatsappNumber.trim(),
      instagram_url: instagramUrl.trim(),
      facebook_url: facebookUrl.trim(),
      youtube_url: youtubeUrl.trim(),
      store_address: storeAddress.trim(),
      contact_email: contactEmail.trim(),
      about_content: aboutContent.trim(),
      location_map_url: locationMapUrl.trim(),
      hero_title: heroTitle.trim(),
      hero_subtitle: heroSubtitle.trim(),
      seo_keywords: seoKeywords.trim(),
      custom_phone_models: customPhoneModels.trim(),
      footer_tagline: footerTagline.trim(),
      pickup_notice: pickupNotice.trim(),
      pickup_label: pickupLabel.trim(),
      search_placeholder: searchPlaceholder.trim(),
      chat_greeting: chatGreeting.trim(),
      contact_whatsapp_message: contactWhatsAppMessage.trim(),
      home_categories_title: homeCategoriesTitle.trim(),
      home_featured_title: homeFeaturedTitle.trim(),
      home_new_arrivals_title: homeNewArrivalsTitle.trim(),
      home_all_products_title: homeAllProductsTitle.trim(),
      footer_copyright: footerCopyright.trim(),
    };

    const res = await api.updateSettings(payload);
    setSaving(false);

    if (res.success) {
      setSuccessMsg('Website settings saved successfully!');
      await reloadSettings();
    } else {
      setError(res.error || 'Failed to save website settings');
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setUpdatingPassword(true);
    setError('');
    setSuccessMsg('');
    const res = await api.changePassword(newPassword);
    setUpdatingPassword(false);
    if (res.success) {
      setSuccessMsg('Admin password updated successfully!');
      setNewPassword('');
    } else {
      setError(res.error || 'Failed to update password');
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
              <div className="h-10 w-full bg-ash/50 rounded" />
              <div className="h-10 w-full bg-ash/50 rounded" />
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
          {/* Title */}
          <div>
            <h1 className="font-serif text-headline-md text-ink-black">
              <span className="butter-underline">Website Settings</span>
            </h1>
            <p className="font-sans text-body-sm text-smoke mt-1">
              Fully customize headers, titles, marquee deals, phone numbers, map location, and social links across the entire store.
            </p>
          </div>

          {/* Alerts */}
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
            {/* Branding & Header */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Header &amp; Store Branding</h2>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Store Title / Logo Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Upanishad Mobile Store"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Top Marquee Scrolling Deals Ticker Text
                </label>
                <textarea
                  value={marqueeText}
                  onChange={(e) => setMarqueeText(e.target.value)}
                  rows={2}
                  placeholder="⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals! ⚡"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Contact &amp; Store Location</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 96667 31286"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>

                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    WhatsApp Number (Digits only)
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+919666731286"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Instagram Profile Link
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/upanishadmobiles/"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Facebook Page Link
                </label>
                <input
                  type="text"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://www.facebook.com/yourpage"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  YouTube Channel Link
                </label>
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@yourchannel"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Store Email Address
                </label>
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="upanishadmobiles@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Full Store Address
                </label>
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  rows={2}
                  placeholder="Street, Area, City, State, PIN"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Google Maps Store Location Link
                </label>
                <input
                  type="text"
                  value={locationMapUrl}
                  onChange={(e) => setLocationMapUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            {/* About Us Page Content */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">About Us Page</h2>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  About Us Content (shown on /about)
                </label>
                <textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  rows={6}
                  placeholder="Write a description of your store here..."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>
            </div>

            {/* Homepage Banner Section */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Homepage Hero Banner Text</h2>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Hero Banner Heading Title
                </label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Modern Tech, Curated for You"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Hero Subtitle Description
                </label>
                <input
                  type="text"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Search Engine Optimization (SEO)</h2>
              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  SEO Keywords
                </label>
                <textarea
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  rows={3}
                  placeholder="Comma-separated keywords, e.g. mobile shop Visakhapatnam, phone covers, iPhone cases, tempered glass, new arrival mobiles..."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-y"
                />
                <p className="font-sans text-caption text-smoke mt-1.5">
                  These keywords display at the bottom of every page (below the footer) and are injected into the page's SEO meta tags to help search engines understand your store.
                </p>
              </div>
            </div>

            {/* Store Content & Messaging */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Store Content &amp; Messaging</h2>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Footer Tagline
                </label>
                <input
                  type="text"
                  value={footerTagline}
                  onChange={(e) => setFooterTagline(e.target.value)}
                  placeholder="Store Pickup Only • Premium Cases & Accessories"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Store Pickup Label
                </label>
                <input
                  type="text"
                  value={pickupLabel}
                  onChange={(e) => setPickupLabel(e.target.value)}
                  placeholder="Store Pickup Only"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Pickup Notice (shown on product pages)
                </label>
                <textarea
                  value={pickupNotice}
                  onChange={(e) => setPickupNotice(e.target.value)}
                  rows={2}
                  placeholder="Store only accepts pickups. Message us on WhatsApp or call to inquire about availability."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Search Bar Placeholder Text
                </label>
                <input
                  type="text"
                  value={searchPlaceholder}
                  onChange={(e) => setSearchPlaceholder(e.target.value)}
                  placeholder="Search Upanishad Mobiles..."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  AI Chat Assistant Greeting
                </label>
                <textarea
                  value={chatGreeting}
                  onChange={(e) => setChatGreeting(e.target.value)}
                  rows={3}
                  placeholder="👋 Hi! I'm your AI Shopping Assistant..."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-none"
                />
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  WhatsApp Order Message Prefix
                </label>
                <input
                  type="text"
                  value={contactWhatsAppMessage}
                  onChange={(e) => setContactWhatsAppMessage(e.target.value)}
                  placeholder="Hi Upanishad Mobile Store, I would like to reserve/order:"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            {/* Homepage Section Titles */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Homepage Section Titles</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    Categories Section Title
                  </label>
                  <input
                    type="text"
                    value={homeCategoriesTitle}
                    onChange={(e) => setHomeCategoriesTitle(e.target.value)}
                    placeholder="Shop by Category"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    Top Recommended Title
                  </label>
                  <input
                    type="text"
                    value={homeFeaturedTitle}
                    onChange={(e) => setHomeFeaturedTitle(e.target.value)}
                    placeholder="Top Recommended"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    New Arrivals Title
                  </label>
                  <input
                    type="text"
                    value={homeNewArrivalsTitle}
                    onChange={(e) => setHomeNewArrivalsTitle(e.target.value)}
                    placeholder="New Arrivals"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                    All Products Title
                  </label>
                  <input
                    type="text"
                    value={homeAllProductsTitle}
                    onChange={(e) => setHomeAllProductsTitle(e.target.value)}
                    placeholder="All Products"
                    className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Footer Copyright Text
                </label>
                <input
                  type="text"
                  value={footerCopyright}
                  onChange={(e) => setFooterCopyright(e.target.value)}
                  placeholder="All rights reserved."
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
                />
              </div>
            </div>

            {/* Phone Model Presets Section */}
            <div className="bg-white border border-ash rounded p-5 space-y-5">
              <h2 className="font-serif text-title-md text-ink-black">Phone Model Presets</h2>              <div>
                <label className="font-sans text-label-sm text-smoke uppercase tracking-widest block mb-1.5">
                  Custom Phone Models List (One per line or comma-separated)
                </label>
                <textarea
                  value={customPhoneModels}
                  onChange={(e) => setCustomPhoneModels(e.target.value)}
                  rows={4}
                  placeholder="e.g. iPhone 17 Pro Max, Samsung Galaxy S25 Ultra, OnePlus 13"
                  className="w-full px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6] resize-y"
                />
                <p className="font-sans text-caption text-smoke mt-1.5">
                  Add custom phone models here. These will show up as selectable options in the "Quick Add Popular Phone Models" dropdown when adding or editing products in the admin panel.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#004ac6] text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-[#003b9e] disabled:opacity-50 transition-colors shadow-md"
              >
                {saving ? 'Saving Settings...' : 'Save All Settings'}
              </button>
            </div>
          </form>

          {/* Admin Password Security Section */}
          <div className="bg-white border border-ash rounded p-5 space-y-4">
            <h2 className="font-serif text-title-md text-ink-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">lock</span>
              Admin Security &amp; Password Update
            </h2>
            <p className="font-sans text-caption text-smoke">
              Update your admin account password anytime directly from this panel without editing code or database tables.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new admin password..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-ash rounded font-sans text-body-sm text-ink-black focus:outline-none focus:border-[#004ac6]"
              />
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={updatingPassword || !newPassword}
                className="px-6 py-2.5 bg-ink-black text-white font-sans text-label-sm uppercase tracking-widest rounded hover:bg-smoke disabled:opacity-50 transition-colors shrink-0"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
