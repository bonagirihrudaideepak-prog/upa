# Hostinger Upload & Deployment Guide (PHP + MySQL)

Follow these simple steps to deploy your **Upanishad Store** application to **Hostinger Shared Web Hosting** using the complete PHP + MySQL backend (no Node.js required).

---

## 📋 Step 1: Create Hostinger MySQL Database

1. Log in to your **[Hostinger hPanel](https://hpanel.hostinger.com/)**.
2. Navigate to **Databases** -> **MySQL Databases**.
3. Create a new database:
   - **Database Name**: e.g., `u123456789_upanishad`
   - **Username**: e.g., `u123456789_admin`
   - **Password**: `YourStrongPassword`
4. Click **Create**.

---

## 🗄️ Step 2: Import Database Schema & Seed Data

1. In hPanel, click **Enter phpMyAdmin** next to your new database.
2. Click the **Import** tab at the top.
3. Choose the [`hostinger_php/db.sql`](db.sql) file from this repository.
4. Click **Go** / **Import**.
   *(This automatically creates all tables and inserts dummy products, categories, reviews, and offer banners!)*

> If your Hostinger user is restricted from the `CREATE DATABASE` statement, run the `db.sql` file directly inside your existing database (skip lines 1–6) or remove the `CREATE DATABASE` / `USE` lines first.

---

## ⚙️ Step 3: Configure Database Connection in PHP

Edit [`hostinger_php/config/database.php`](config/database.php) — or better, set environment variables in hPanel so no code changes are needed:

```php
$host = 'localhost';
$dbname = 'u123456789_upanishad';
$username = 'u123456789_admin';
$password = 'YourStrongPassword';
```

You can set `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT` as environment variables under **Advanced** -> **Environment Variables** in hPanel.

---

## 📁 Step 4: Upload Files to Hostinger `public_html`

1. In hPanel, open **Files** -> **File Manager**.
2. Open the `public_html` folder.
3. Upload all files from the compiled React frontend **`frontend/dist/`**:
   - `index.html`
   - `assets/`
4. Upload all files from the **`hostinger_php/`** directory into `public_html`:
   - `.htaccess`
   - `index.php`
   - `config/`
   - `uploads/`

---

## 🚀 Step 5: What the PHP Backend Provides

`hostinger_php/index.php` is a complete drop-in replacement for the Node.js/Express API:

| Area | Endpoints |
| :--- | :--- |
| Health | `GET /api/health` |
| Settings | `GET /api/settings`, `POST /api/admin/settings` |
| Categories | `GET /api/categories`, `GET\|POST\|PUT\|DELETE /api/admin/categories` |
| Products | `GET /api/products`, `/api/products/:id`, `/api/products/featured`, `/api/products/new-arrivals`, `/api/products/search?q=`, `/api/products/category/:slug` |
| Reviews | `GET /api/products/:id/reviews`, `POST /api/reviews` |
| Likes | `POST /api/products/:id/like` |
| Offers | `GET /api/offers`, `GET\|POST\|PUT\|DELETE /api/admin/offers` |
| Admin Auth | `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/me` |
| Dashboard | `GET /api/admin/dashboard` |
| Uploads | `POST /api/upload`, `DELETE /api/upload` |

- Admin routes are protected with **JWT** (HS256) — the frontend sends the token via `Authorization: Bearer <token>`.
- File uploads are validated (jpg/jpeg/png/gif/webp only) and stored under `uploads/` with path-traversal protection on delete.

---

## 🔑 Default Admin Credentials

| Username | Password | Admin URL |
| :--- | :--- | :--- |
| `Test123admin01` | `Flipkartzon01123` | `https://yourdomain.com/admin` |

> The `db.sql` seeds this admin user and password hash automatically. Change the password after first login by updating the `password_hash` in the `admin_users` table (use `password_hash()` in PHP).

---

## 🛠️ Everything Is Editable From the Admin Panel

Every piece of site content is stored in the `site_settings` table and editable from **Admin → Settings** (no code changes needed):

| Area | Setting keys |
| :--- | :--- |
| Brand name | `store_name` (used in header, footer, admin, login, product detail) |
| Marquee / top bar | `marquee_text` |
| Contact & location | `contact_phone`, `contact_email`, `whatsapp_number`, `store_address`, `location_map_url` |
| Social links | `facebook_url`, `instagram_url`, `youtube_url` |
| Hero section | `hero_title`, `hero_subtitle` |
| About page | `about_content` |
| SEO | `seo_keywords` |
| Footer | `footer_tagline`, `footer_copyright` |
| Store messaging | `pickup_notice`, `pickup_label`, `chat_greeting`, `contact_whatsapp_message` |
| Search | `search_placeholder` |
| Homepage section titles | `home_categories_title`, `home_featured_title`, `home_new_arrivals_title`, `home_all_products_title` |

Plus full CRUD for **Categories** (rename, image, deactivate→hides products), **Products** (create/edit/delete, move between categories, models/colors, no SKU), and **Offer banners** — all from the admin panel.

> `config/database.php` auto-seeds any missing settings on first run, so a fresh import of `db.sql` + a single request fully initialises all keys. No manual SQL required.

---

## 💻 Local Development (PHP built-in server)

From the project root:

```bash
php -S 127.0.0.1:8000 -t hostinger_php
```

Make sure `pdo_mysql` is enabled in your local `php.ini` and that `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` point to a local MySQL database you've imported `db.sql` into.
