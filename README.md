# 📱 Upanishad mobiles

Welcome to the official repository for **Upanishad mobiles** — a modern, fast, and fully dynamic online storefront and admin management platform for smartphones, mobile covers, cases, and tech accessories.

---

## 🌐 Live Website & Admin Links

| Resource | Link |
|---|---|
| 🛍️ **Live Website (Storefront)** | [**https://upanishad-store.onrender.com**](https://upanishad-store.onrender.com) |
| 🔐 **Admin Management Dashboard** | [**https://upanishad-store.onrender.com/admin**](https://upanishad-store.onrender.com/admin) |

---

## 🔑 Admin Access & Secret Keyboard Shortcut

- **Username**: `admin`
- **Password**: `admin123`

> 💡 **Quick Access Shortcut**: On any page of the live website, press **`Ctrl + Shift + U`** on your keyboard to instantly open the Admin Login panel!

---

## 📖 Easy Store Owner Guide (No Coding Required!)

This website is **100% dynamic**. You can update all text, images, products, and contact links directly from the Admin Panel without touching a single line of code!

---

### 1. 🛍️ How to Add a New Product
1. Log in to the [Admin Panel](https://upanishad-store.onrender.com/admin).
2. Click **Products** in the left menu, then click the **Add Product** button.
3. Fill in:
   - **Product Name** (e.g. *iPhone 16 Matte Glass Cover*)
   - **Price** in Rupees (₹)
   - **Category** (e.g. *iPhone*, *Samsung*, *Accessories*, *Gadgets*)
   - **Stock Quantity** (Number of items available)
   - **Initial Likes Count** *(Optional)*: Enter a starting number (e.g. `50` or `500`) to highlight a popular item!
4. **Upload Images**: Click **Choose File** to upload pictures from your phone or computer, or paste an image link.
5. **Color Options**: Choose from color palettes (Natural Titanium, Midnight Black, Saddle Brown, etc.) — no hex codes required!
6. Click **Save Product**.

---

### 2. 📢 How to Add Banner Promotions / Offers
1. Go to **Banners & Offers** in the Admin Panel menu.
2. Click **Add Banner / Offer**.
3. Type the **Title** (e.g. *Monsoon Offer — 20% Off All Covers*).
4. **Upload Image**: Click **Upload File** to choose a banner image from your computer, or click **Web Image URL** to paste a picture link.
5. Toggle **Active** to display it on the homepage.
6. Click **Create Banner**.

---

### 3. ⚙️ How to Change Store Contact Info, WhatsApp & Announcement Bar
1. Go to **Website Settings** in the Admin Panel menu.
2. You can instantly change:
   - **Store Name**: `Upanishad Mobile Store`
   - **Top Announcement Bar (Marquee)**: Scrolling offer message at the top of every page.
   - **Contact Phone**: Store contact phone number.
   - **WhatsApp Number**: For customer takeaway & order inquiries (`+91 96667 31286`).
   - **Instagram Link**: Link to store Instagram page.
   - **Google Maps Location Link**: Direct shop location link.
   - **Homepage Headline & Subtitle**: Welcome titles on the main page.
3. Click **Save Settings**. All changes update live on the website instantly!

---

## 📍 Physical Store Location & Contact

- **Store Name**: Upanishad Mobile Store
- **Phone / WhatsApp**: [+91 96667 31286](https://wa.me/919666731286)
- **Instagram**: [@upanishadmobiles](https://www.instagram.com/upanishadmobiles/)
- **Google Maps Location**: [Open in Google Maps](https://maps.app.goo.gl/JRej6So64iYYm7ia6)
- **Order Model**: In-store Pickup & Takeaway

---

## 🛠️ Technical Architecture (For Developers)

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS
- **Backend**: Node.js, Express.js, Gzip Compression, In-Memory TTL Cache
- **Database**: PostgreSQL (Production) / SQLite (Development) with Knex.js ORM
- **Security**: JWT Authentication, Rate Limiting, Input Sanitization (XSS Defense), Security Headers
- **Hosting**: Render (Zero-downtime continuous deployment via GitHub triggers)
