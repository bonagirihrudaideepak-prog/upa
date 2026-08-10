# 📱 Upanishad Mobiles — Premium Storefront & E-Commerce Application

[![Live Demo](https://img.shields.io/badge/Live_Site-upanishadmobiles.com-004ac6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://upanishadmobiles.com/)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build_Tool-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PHP](https://img.shields.io/badge/Backend-PHP_8.x_%7C_MySQL-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)

> **Live Website:** [https://upanishadmobiles.com/](https://upanishadmobiles.com/)

**Upanishad Mobiles** is a modern, high-performance web application built for a retail mobile store and accessory brand. It combines a dynamic storefront with a complete administrative dashboard for inventory management, promotional banners, category customization, and site configuration.

---

## 🌟 Key Highlights & Features

### 🛒 Customer Storefront
* **Dynamic Brand Categories**: Dedicated curated categories for **iPhone**, **Samsung**, **Oppo**, **Vivo**, **Cases**, and **Screen Guards**.
* **Auto-Rotating "New Arrivals"**: Automatically features the top 12 newest products sorted by creation date (`created_at DESC`). As new items are uploaded, older products naturally shift out of New Arrivals without manual intervention.
* **Rich Product Experience**: High-resolution image galleries, interactive product detail modals, multi-variant selections (colors, storage options, models), and real-time inventory stock indicators.
* **Instant Customer Ordering**: One-click WhatsApp ordering pre-filled with product details (`+91 96667 31286`), direct phone contact links, and store pickup options.
* **Real-time Search & Filtering**: Instant search across name, category, and SKU with responsive filtering.
* **Promotional Offer Banners**: Dynamic carousel for sales announcements, seasonal offers, and custom photo cover printing bookings.

### 🛠️ Secure Admin Dashboard
* **Product Catalog Management**: Full CRUD operations for products, SKU assignment, pricing, and multi-image uploads.
* **Variant & Stock Control**: Real-time management of color swatches, model variants, and stock counts.
* **Promotional Banner Control**: Create and activate high-converting promotional banners.
* **Category Customization**: Add, reorder, and update category imagery and metadata.
* **Site Settings Manager**: Real-time management of marquee text, store address, contact numbers, map URLs, and SEO meta tags.
* **🔒 Hidden Security Architecture**: Zero-footprint admin login route (`/admin`) hidden from public UI menus, footer links, and keyboard shortcuts for privacy and protection.

---

## 🏗️ Architecture & Dual Backend Support

The application is engineered with **Dual Backend Parity**, allowing seamless deployment across any hosting environment:

1. **Native PHP 8.x + MySQL Backend (`hostinger_php/`)**:
   - Zero-dependency native PHP REST API with PDO MySQL connection pooling.
   - Built-in `autoInitDatabase()` function that automatically creates required tables, seeds starter categories, site settings, and initial inventory on first API hit.
   - Apache `.htaccess` rewrite engine for single-page application (SPA) routing and CORS headers.
   - Ideal for shared web hosting environments (e.g., Hostinger).

2. **Node.js + Express + Knex.js Backend (`server.js`, `routes/`)**:
   - Modular Express REST API with Knex SQL query builder.
   - Compatible with SQLite (local development) and MySQL / PostgreSQL.
   - Ideal for Node.js environments (VPS, Render, Railway, AWS EC2).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React 18, TypeScript, React Router v6 |
| **Build & Styling** | Vite, Tailwind CSS, Material Symbols, Lucide Icons |
| **Production Backend** | PHP 8.x, PDO, Apache `.htaccess` SPA Routing |
| **Node Backend** | Node.js, Express.js, Knex.js |
| **Database** | MySQL / MariaDB (UTF8MB4) |
| **Authentication** | JWT (JSON Web Tokens) with bcrypt password hashing |
| **Deployment Target** | Hostinger Cloud Infrastructure / Shared Web Hosting |

---

## 📁 Repository Directory Structure

```
upanishad_render/
├── frontend/                       # React 18 + Vite + TypeScript Frontend
│   ├── public/                     # Static assets & favicons (SVG, ICO)
│   ├── src/
│   │   ├── components/             # Reusable UI components (Header, Footer, Product, Admin)
│   │   ├── context/                # Global React Context (AppContext)
│   │   ├── pages/                  # Page routes (Landing, Catalog, Detail, Admin)
│   │   ├── types/                  # TypeScript definitions & API contracts
│   │   ├── utils/                  # API client & helper utilities
│   │   └── App.tsx                 # Main SPA Router configuration
│   ├── dist/                       # Production build output
│   └── package.json
│
├── hostinger_php/                  # Native PHP 8.x + MySQL REST API Backend
│   ├── config/
│   │   ├── database.php            # PDO connection & auto-schema seeding
│   │   └── auth.php                # JWT token signing & authentication helpers
│   ├── uploads/                    # Product & category image uploads directory
│   ├── .htaccess                   # Apache SPA fallback & CORS configuration
│   ├── db.sql                      # Production MySQL database dump schema
│   └── index.php                   # Unified PHP REST API Router
│
├── routes/                         # Express REST API routes (Node.js version)
├── server.js                       # Express application entry point (Node.js version)
├── db.js                           # Knex database configuration (Node.js version)
└── README.md                       # Comprehensive Project Documentation
```

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **PHP**: v8.0 or higher (for PHP backend testing)
* **MySQL**: v8.0 or MariaDB (optional for local database testing)

### 1. Clone the Repository
```bash
git clone https://github.com/bonagirihrudaideepak-prog/upa.git
cd upa
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start Frontend Development Server
```bash
npm run dev
```
The application will be accessible locally at `http://localhost:5173`.

---

## 📡 API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/settings` | Retrieve store settings & marquee configuration |
| `GET` | `/api/categories` | Fetch active brand & product categories |
| `GET` | `/api/offers` | Fetch active promotional banner offers |
| `GET` | `/api/products` | Fetch full product catalog |
| `GET` | `/api/products/featured` | Fetch featured products showcase |
| `GET` | `/api/products/new-arrivals` | Fetch top 12 auto-rotating new arrival products |
| `GET` | `/api/products/search?q={query}` | Search products by name, SKU, or category |
| `POST` | `/api/products/{id}/like` | Increment product like count |

### Admin Endpoints (Requires Authorization Token)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate admin user & receive JWT token |
| `GET` | `/api/admin/dashboard` | Fetch store stats, recent uploads & top liked products |
| `GET` | `/api/admin/products` | Manage full product catalog |
| `POST` | `/api/admin/products` | Create a new product with image uploads & variants |
| `PUT` | `/api/admin/products/{id}` | Update product details, pricing, stock & images |
| `DELETE` | `/api/admin/products/{id}` | Delete a product from inventory |
| `POST` | `/api/admin/settings` | Update global store settings, marquee & contact details |

---

## 🔐 Administrative Access

* **Admin Portal Route**: `/admin`
* **Authentication**: Secured via JWT (JSON Web Tokens) and bcrypt password encryption.
* **Environment Configuration**: Set custom admin credentials via environment variables (`ADMIN_USERNAME` & `ADMIN_PASSWORD`) or database configuration.

---

## 📄 License & Attribution

Designed and developed for **Upanishad Mobiles**.  
Store Location: Mobile Point Road, Visakhapatnam, Andhra Pradesh, India.  
Contact: `+91 96667 31286` | [Instagram](https://www.instagram.com/upanishadmobiles/)
