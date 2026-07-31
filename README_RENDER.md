# Upanishad Store - Render Deployment Guide

This standalone directory (`upanishad_render`) is configured for 1-click or automated Docker Web Service deployment on **[Render.com](https://render.com/)**.

---

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Initialize Git & Push to GitHub
1. Open terminal inside the `upanishad_render` folder:
   ```bash
   cd C:\Users\durga\OneDrive\Desktop\upanishad_render
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   ```
2. Create a new repository on GitHub (e.g. `upanishad-store-render`).
3. Connect and push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/upanishad-store-render.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Create Web Service on Render
1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repository `upanishad-store-render`.
4. Render will automatically detect the **`Dockerfile`**.
5. Configure basic settings:
   - **Name**: `upanishad-store`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`

---

### Step 3: Configure Database Environment Variables
In the **Environment Variables** section on Render, add your MySQL database connection credentials (e.g., from Aiven, PlanetScale, Railway, or hostinger MySQL):

| Key | Value Example |
| :--- | :--- |
| `DB_HOST` | `your-db-host.com` or IP |
| `DB_PORT` | `3306` |
| `DB_NAME` | `upanishad_store` |
| `DB_USER` | `your_db_username` |
| `DB_PASS` | `your_db_password` |

---

### Step 4: Deploy & Initialize Database
1. Click **Create Web Service**. Render will build the Docker container (compiling React frontend & setting up PHP Apache) and launch your live URL (e.g. `https://upanishad-store.onrender.com`).
2. Visit `https://your-app-name.onrender.com/import_db.php` or `https://your-app-name.onrender.com/dashboard_setup.php` to initialize your database tables and default admin login (`admin` / `admin123`).
