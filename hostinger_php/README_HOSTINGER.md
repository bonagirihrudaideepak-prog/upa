# Hostinger Upload & Deployment Guide (PHP + MySQL)

Follow these simple steps to deploy your **Upanishad Store** application to **Hostinger Shared Web Hosting**.

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
3. Choose the [`hostinger_php/db.sql`](file:///C:/Users/durga/OneDrive/Desktop/upanishad_render/hostinger_php/db.sql) file from this repository.
4. Click **Go** / **Import**.  
   *(This automatically creates all tables and inserts dummy products, categories, reviews, and offer banners!)*

---

## ⚙️ Step 3: Configure Database Connection in PHP

1. Open [`hostinger_php/config/database.php`](file:///C:/Users/durga/OneDrive/Desktop/upanishad_render/hostinger_php/config/database.php) or set environment variables in hPanel:
   ```php
   $host = 'localhost';
   $dbname = 'u123456789_upanishad';
   $username = 'u123456789_admin';
   $password = 'YourStrongPassword';
   ```

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

## 🔑 Default Admin Credentials

| Username | Password | Admin URL |
| :--- | :--- | :--- |
| `admin` | `admin123` | `https://yourdomain.com/admin` |
