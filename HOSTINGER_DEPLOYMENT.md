# 🚀 Deploying Upanishad Mobiles Store on Hostinger

This guide provides step-by-step instructions for deploying the **Upanishad Mobiles Store** on **Hostinger**.

---

## 📋 Overview

The project is a full-stack Node.js + Express application serving a Vite React frontend.

It can be hosted on Hostinger using two main methods:
1. **Method A: Hostinger Web / Cloud Hosting (hPanel Node.js Selector)** *(Recommended for standard Hostinger plans)*
2. **Method B: Hostinger VPS (Virtual Private Server with PM2 & Nginx)** *(Recommended for VPS plans)*

---

## 🛠️ Method A: Deploy on Hostinger Web / Cloud Hosting (hPanel)

### Step 1: Create a MySQL Database in Hostinger
1. Log in to **Hostinger hPanel**.
2. Go to **Databases** ➔ **MySQL Databases**.
3. Create a new Database:
   - **Database Name**: e.g., `u123456789_upanishad`
   - **Username**: e.g., `u123456789_admin`
   - **Password**: *Create a strong password and save it*.
4. Click **Create**.

---

### Step 2: Set Up Node.js Application in hPanel
1. In hPanel, go to **Websites** ➔ select your domain.
2. Search or select **Setup Node.js App** (or **Node.js** under Advanced).
3. Click **Create Application** and configure:
   - **Node.js Version**: Select **20.x** or **18.x**.
   - **Application Mode**: `Production`
   - **Application Root**: `public_html` (or project root directory)
   - **Application URL**: `yourdomain.com`
   - **Application Startup File**: `server.js`
4. Click **Create**.

---

### Step 3: Upload Project Files
You can upload the project files using any of these 3 ways:

#### Option 1: Hostinger Git Integration (Easiest & Automatic)
1. Push your latest code to your **GitHub / GitLab** repository.
2. In Hostinger hPanel, go to **Advanced** ➔ **Git**.
3. Add your repository URL (`https://github.com/your-username/your-repo.git`) and branch (`main`).
4. Click **Create / Deploy**.

#### Option 2: Upload Zip via File Manager
1. Zip the project folder on your computer (**Exclude `node_modules` and `.git`**).
2. Go to Hostinger **File Manager** ➔ Open `public_html`.
3. Upload the `.zip` file and click **Extract**.

---

### Step 4: Configure Environment Variables (`.env`)
1. In Hostinger File Manager, create or edit the `.env` file in your app directory.
2. Add the following variables:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=super_secret_jwt_key_change_this_123!

# Hostinger MySQL Database Credentials
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=u123456789_upanishad
DB_USER=u123456789_admin
DB_PASS=your_mysql_password_here
DB_SSL=false
```

---

### Step 5: Install Dependencies & Build Frontend
1. Open the Hostinger SSH/Terminal or hPanel Terminal.
2. Navigate to your app directory:
   ```bash
   cd public_html
   ```
3. Install dependencies and build the frontend:
   ```bash
   npm install
   npm run build
   ```

---

### Step 6: Start/Restart the App
1. Go back to **Setup Node.js App** in hPanel.
2. Click **Restart Application**.
3. Visit `https://yourdomain.com` in your browser!

---

## 🐧 Method B: Deploy on Hostinger VPS (Ubuntu / Debian)

If you have a **Hostinger VPS**, follow these SSH steps:

### Step 1: Connect to VPS via SSH
```bash
ssh root@YOUR_HOSTINGER_VPS_IP
```

### Step 2: Install Node.js, PM2, and Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx mysql-server
sudo npm install -g pm2
```

### Step 3: Clone Repository & Build Project
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git upanishad-store
cd upanishad-store

npm install
npm run build
```

### Step 4: Set Up `.env` File
Create `.env` inside `/var/www/upanishad-store`:
```env
PORT=10000
NODE_ENV=production
JWT_SECRET=your_vps_jwt_secret_key

DB_TYPE=sqlite  # Or use mysql / postgres
```

### Step 5: Start Application with PM2
```bash
pm2 start server.js --name "upanishad-store"
pm2 save
pm2 startup
```

### Step 6: Configure Nginx & SSL (Certbot)
Create `/etc/nginx/sites-available/upanishad`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site & restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/upanishad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Install free SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ⚡ Verification & Checklist

- [ ] Node.js server starting without errors (`npm start` or `pm2 status`)
- [ ] Database initialised (categories & admin user auto-seeded)
- [ ] Frontend static bundle (`frontend/dist`) serving properly at `/`
- [ ] Admin dashboard accessible at `/admin` (Default: `admin` / `admin123`)
- [ ] File uploads directory (`/uploads`) writable by the server
