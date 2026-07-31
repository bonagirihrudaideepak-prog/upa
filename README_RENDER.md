# Upanishad Store - Render Deployment Guide (Node.js + Database)

This repository is configured for **1-click Node.js deployment on [Render.com](https://render.com/)**.

---

## ⚡ What Changed? (PHP → Node.js Migration)

The backend has been completely converted from PHP to a high-performance **Node.js (Express) backend** with dynamic database support:
- **Zero-Config SQLite Support (Default)**: Runs automatically out of the box with zero external database setup!
- **Render PostgreSQL & MySQL Compatible**: Connect any Render PostgreSQL or external MySQL database simply by adding environment variables.
- **Unified Single Web Service Deployment**: Express automatically serves both the API endpoints (`/api/*`) and the compiled React production frontend.

---

## 🚀 Step-by-Step Deployment Instructions on Render

### Step 1: Push to GitHub
1. Open your terminal inside `upanishad_render`:
   ```bash
   git init
   git add .
   git commit -m "Migrate backend to Node.js for Render deployment"
   ```
2. Connect and push your code to your GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/upanishad-store.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Create Web Service on Render
1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and pick your repository.
4. Render will automatically detect the **Node.js environment** (`render.yaml` / `package.json`).
5. Configure basic settings:
   - **Name**: `upanishad-store`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

---

### Step 3: Database & Environment Setup

#### Option A: Zero Setup (SQLite) - Default
- No environment variables required! The application automatically initializes an embedded SQLite database with pre-created tables, initial categories, and default admin login.

#### Option B: Render Managed PostgreSQL (Recommended for Persistent Cloud DB)
Create a free PostgreSQL instance on Render and add this key to your Web Service **Environment Variables**:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://user:password@host/database` |

#### Option C: External MySQL Database
Add your MySQL credentials to Environment Variables:

| Key | Value Example |
| :--- | :--- |
| `DB_HOST` | `your-db-host.com` |
| `DB_PORT` | `3306` |
| `DB_NAME` | `upanishad_store` |
| `DB_USER` | `your_db_user` |
| `DB_PASS` | `your_db_password` |

---

## 🔑 Default Admin Login Credentials

| Username | Password |
| :--- | :--- |
| `admin` | `admin123` |

Admin Dashboard route: `/admin` (or `/admin/login`)

---

## 🛠 Local Development & Testing

Run the Node backend locally:
```bash
npm start
```
The server will run on `http://localhost:8000`.
