const knex = require('knex');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

function getDbConfig() {
  const dbUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST;
  const dbType = (process.env.DB_TYPE || '').toLowerCase();

  // 1. PostgreSQL (Render Managed Postgres)
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://') || dbType === 'postgres' || dbType === 'postgresql')) {
    let connectionUrl = dbUrl;
    if (connectionUrl.startsWith('postgres://')) {
      connectionUrl = connectionUrl.replace('postgres://', 'postgresql://');
    }
    console.log('[DB] Connecting to PostgreSQL database...');
    return {
      client: 'pg',
      connection: {
        connectionString: connectionUrl,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
      },
      pool: { min: 2, max: 10 }
    };
  }
  
  // 2. MySQL (only if DB_TYPE is explicitly set to 'mysql')
  if (dbType === 'mysql') {
    console.log('[DB] Connecting to MySQL database...');
    return {
      client: 'mysql2',
      connection: {
        host: dbHost || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'upanishad_store',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
      },
      pool: { min: 2, max: 10 }
    };
  }

  // 3. Default zero-config fallback to SQLite
  console.log('[DB] Using embedded SQLite database...');
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return {
    client: 'sqlite3',
    connection: {
      filename: path.join(dataDir, 'upanishad.sqlite')
    },
    useNullAsDefault: true
  };
}

let db = knex(getDbConfig());

async function initDb() {
  try {
    // 1. Categories
    if (!(await db.schema.hasTable('categories'))) {
      await db.schema.createTable('categories', table => {
        table.increments('id').primary();
        table.string('name', 100).notNullable();
        table.string('slug', 100).unique();
        table.text('description');
        table.boolean('is_active').defaultTo(true);
        table.integer('display_order').defaultTo(0);
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "categories" table');
    }

    // 2. Products
    if (!(await db.schema.hasTable('products'))) {
      await db.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.text('description');
        table.string('sku', 50).unique();
        table.decimal('price', 10, 2).notNullable();
        table.string('category', 100).notNullable();
        table.integer('stock').defaultTo(0);
        table.boolean('is_featured').defaultTo(false);
        table.boolean('is_new_arrival').defaultTo(false);
        table.boolean('is_offer').defaultTo(false);
        table.boolean('is_out_of_stock').defaultTo(false);
        table.integer('likes_count').defaultTo(0);
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "products" table');
    }

    // 3. Product Images
    if (!(await db.schema.hasTable('product_images'))) {
      await db.schema.createTable('product_images', table => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.string('image_path', 255).notNullable();
        table.string('image_type', 20).defaultTo('main');
        table.boolean('is_original_1_1').defaultTo(false);
        table.boolean('is_original_3_4').defaultTo(false);
        table.integer('display_order').defaultTo(0);
      });
      console.log('[DB] Created "product_images" table');
    }

    // 4. Product Variants
    if (!(await db.schema.hasTable('product_variants'))) {
      await db.schema.createTable('product_variants', table => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.string('color', 50).notNullable();
        table.string('color_code', 20).notNullable();
        table.string('model', 100);
        table.integer('stock').defaultTo(0);
      });
      console.log('[DB] Created "product_variants" table');
    }

    // 5. Offers
    if (!(await db.schema.hasTable('offers'))) {
      await db.schema.createTable('offers', table => {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.string('image_path', 255);
        table.string('link', 255);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "offers" table');
    }

    // 6. Reviews
    if (!(await db.schema.hasTable('reviews'))) {
      await db.schema.createTable('reviews', table => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.string('user_name', 100).notNullable();
        table.integer('rating').notNullable();
        table.text('comment');
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "reviews" table');
    }

    // 7. Admin Users
    if (!(await db.schema.hasTable('admin_users'))) {
      await db.schema.createTable('admin_users', table => {
        table.increments('id').primary();
        table.string('username', 50).unique().notNullable();
        table.string('password_hash', 255).notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "admin_users" table');
    }

    // 8. Site Settings (Full dynamic site content management)
    if (!(await db.schema.hasTable('site_settings'))) {
      await db.schema.createTable('site_settings', table => {
        table.string('setting_key', 100).primary();
        table.text('setting_value');
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "site_settings" table');
    }

    // Seed default admin if missing
    const adminCount = await db('admin_users').count('id as count').first();
    if (!adminCount || parseInt(adminCount.count) === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await db('admin_users').insert({
        username: 'admin',
        password_hash: passwordHash
      });
      console.log('[DB] Seeded default admin user (username: admin, password: admin123)');
    }

    // Seed default site settings if empty
    const settingsCount = await db('site_settings').count('setting_key as count').first();
    if (!settingsCount || parseInt(settingsCount.count) === 0) {
      await db('site_settings').insert([
        { setting_key: 'store_name', setting_value: 'Upanishad Mobile Store' },
        { setting_key: 'marquee_text', setting_value: '⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡' },
        { setting_key: 'contact_phone', setting_value: '+91 96667 31286' },
        { setting_key: 'whatsapp_number', setting_value: '+919666731286' },
        { setting_key: 'instagram_url', setting_value: 'https://www.instagram.com/upanishadmobiles/' },
        { setting_key: 'location_map_url', setting_value: 'https://maps.app.goo.gl/JRej6So64iYYm7ia6' },
        { setting_key: 'hero_title', setting_value: 'Modern Tech, Curated for You' },
        { setting_key: 'hero_subtitle', setting_value: 'Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories' },
        { setting_key: 'footer_subtitle', setting_value: 'Store Pickup Only • Premium Smartphones, Cases & Accessories' }
      ]);
      console.log('[DB] Seeded default site settings');
    }

    // Seed default categories if missing
    const catCount = await db('categories').count('id as count').first();
    if (!catCount || parseInt(catCount.count) === 0) {
      await db('categories').insert([
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories', display_order: 1, is_active: true },
        { name: 'iPhone', slug: 'iphone', description: 'Apple iPhone devices and covers', display_order: 2, is_active: true },
        { name: 'Samsung', slug: 'samsung', description: 'Samsung smartphones and covers', display_order: 3, is_active: true },
        { name: 'Accessories', slug: 'accessories', description: 'Covers, cases, tempered glass & protectors', display_order: 4, is_active: true },
        { name: 'Gadgets', slug: 'gadgets', description: 'Smartwatches, earbuds & fast chargers', display_order: 5, is_active: true },
        { name: 'Others', slug: 'others', description: 'Other electronic items & accessories', display_order: 6, is_active: true }
      ]);
      console.log('[DB] Seeded default categories');
    }

    // Seed Dummy Products if empty
    const prodCount = await db('products').count('id as count').first();
    if (!prodCount || parseInt(prodCount.count) === 0) {
      console.log('[DB] Seeding dummy products and offers...');
      const dummyProducts = [
        {
          name: 'iPhone 17 Pro Max',
          description: 'The flagship iPhone with A19 Pro chip, titanium design, and revolutionary camera system.',
          sku: 'IP17PM-256',
          price: 134999.00,
          category: 'Electronics',
          stock: 15,
          is_featured: true,
          is_new_arrival: true,
          is_offer: false,
          is_out_of_stock: false,
          likes_count: 1420,
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
          variants: [
            { color: 'Natural Titanium', color_code: '#bebaa7', model: 'iPhone 17 Pro Max 256GB', stock: 10 },
            { color: 'Deep Blue', color_code: '#2c3e50', model: 'iPhone 17 Pro Max 512GB', stock: 5 }
          ]
        },
        {
          name: 'Samsung Galaxy S25 Ultra',
          description: 'Galaxy AI powered flagship smartphone with integrated S-Pen and 200MP Quad Tele camera.',
          sku: 'SGS25U-512',
          price: 129999.00,
          category: 'Electronics',
          stock: 12,
          is_featured: true,
          is_new_arrival: true,
          is_offer: true,
          is_out_of_stock: false,
          likes_count: 2150,
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
          variants: [
            { color: 'Titanium Gray', color_code: '#708090', model: 'Galaxy S25 Ultra 512GB', stock: 8 },
            { color: 'Titanium Black', color_code: '#1c1c1c', model: 'Galaxy S25 Ultra 1TB', stock: 4 }
          ]
        },
        {
          name: 'MagSafe Premium Matte Leather Case',
          description: 'Premium shockproof matte leather back cover with strong built-in MagSafe magnetic ring.',
          sku: 'MAG-LTR-01',
          price: 1499.00,
          category: 'Accessories',
          stock: 50,
          is_featured: true,
          is_new_arrival: false,
          is_offer: true,
          is_out_of_stock: false,
          likes_count: 3890,
          imageUrl: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800',
          variants: [
            { color: 'Saddle Brown', color_code: '#8B4513', model: 'iPhone 16 Pro', stock: 25 },
            { color: 'Midnight Black', color_code: '#000000', model: 'iPhone 15 Pro Max', stock: 25 }
          ]
        },
        {
          name: 'Wireless Noise Cancelling Earbuds Pro',
          description: 'Active Noise Cancellation (ANC), 36-hour total battery life, HD Spatial Audio, and IPX5 water resistance.',
          sku: 'ANC-EAR-PRO',
          price: 4999.00,
          category: 'Gadgets',
          stock: 30,
          is_featured: true,
          is_new_arrival: true,
          is_offer: false,
          is_out_of_stock: false,
          likes_count: 1850,
          imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
          variants: [
            { color: 'Glossy White', color_code: '#FFFFFF', model: 'Standard ANC', stock: 20 },
            { color: 'Matte Black', color_code: '#121212', model: 'Pro Edition ANC', stock: 10 }
          ]
        },
        {
          name: 'Fast Charging 65W GaN Dual Adapter',
          description: 'Ultra-compact 65W Gallium Nitride fast charger for iPhone, Samsung, MacBooks, and Android devices.',
          sku: 'GAN-65W-CHG',
          price: 2199.00,
          category: 'Gadgets',
          stock: 45,
          is_featured: false,
          is_new_arrival: true,
          is_offer: true,
          is_out_of_stock: false,
          likes_count: 940,
          imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
          variants: [
            { color: 'Pure White', color_code: '#F8F9FA', model: 'Dual Port 65W GaN', stock: 45 }
          ]
        },
        {
          name: 'Customized Photo Printed Glass Cover',
          description: '9H tempered glass back cover customized with your personal photo, design, or name engraving.',
          sku: 'CUST-GLASS-01',
          price: 799.00,
          category: 'Accessories',
          stock: 100,
          is_featured: true,
          is_new_arrival: true,
          is_offer: true,
          is_out_of_stock: false,
          likes_count: 5120,
          imageUrl: 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800',
          variants: [
            { color: 'Glass Print', color_code: '#333333', model: 'iPhone 16 / 15 / Samsung S24', stock: 100 }
          ]
        },
        {
          name: 'Smart Fitness Watch Ultra',
          description: '1.96-inch AMOLED display, Bluetooth calling, SpO2 & Heart Rate monitoring, 100+ sports modes.',
          sku: 'SWT-ULT-01',
          price: 3499.00,
          category: 'Gadgets',
          stock: 20,
          is_featured: false,
          is_new_arrival: false,
          is_offer: true,
          is_out_of_stock: false,
          likes_count: 1250,
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
          variants: [
            { color: 'Ocean Orange', color_code: '#FF6F00', model: '49mm Titanium Style', stock: 10 },
            { color: 'Tactical Black', color_code: '#212121', model: '49mm Black Style', stock: 10 }
          ]
        }
      ];

      for (const item of dummyProducts) {
        const { imageUrl, variants, ...prodData } = item;
        const inserted = await db('products').insert(prodData);
        const productId = Array.isArray(inserted) ? inserted[0] : inserted;

        // Image
        await db('product_images').insert({
          product_id: productId,
          image_path: imageUrl,
          image_type: 'main',
          display_order: 0
        });

        // Variants
        if (variants && variants.length > 0) {
          const varInserts = variants.map(v => ({
            product_id: productId,
            color: v.color,
            color_code: v.color_code,
            model: v.model,
            stock: v.stock
          }));
          await db('product_variants').insert(varInserts);
        }

        // Add dummy review
        await db('reviews').insert({
          product_id: productId,
          user_name: 'Rahul K.',
          rating: 5,
          comment: 'Excellent quality and super fast in-store pickup! Highly recommended.'
        });
      }
      console.log('[DB] Seeded 7 dummy products with images, variants and reviews');
    }

    // Seed Dummy Offers / Banners if empty
    const offerCount = await db('offers').count('id as count').first();
    if (!offerCount || parseInt(offerCount.count) === 0) {
      await db('offers').insert([
        {
          title: 'Mega Monsoon Sale - Up to 50% Off Mobile Accessories',
          description: 'Grab premium iPhone & Samsung cases, screen guards, and fast chargers at unbeatable prices!',
          image_path: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
          link: '/catalog?filter=offers',
          is_active: true
        },
        {
          title: 'Customized Phone Covers Booking Open!',
          description: 'Print your photo, name, or custom art on premium toughened glass covers. Fast store pickup!',
          image_path: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200',
          link: '/catalog',
          is_active: true
        },
        {
          title: 'New Arrival: iPhone 17 & Galaxy S25 Accessories in Stock',
          description: 'Visit Deepak Electronics for exclusive covers, tempered glass, and camera lens protectors!',
          image_path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
          link: '/catalog',
          is_active: true
        }
      ]);
      console.log('[DB] Seeded 3 dummy offer banners');
    }

  } catch (err) {
    console.error('[DB] Initialization error:', err);
  }
}

// Helpers for data formatting
function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: Number(p.id),
    price: Number(p.price),
    stock: Number(p.stock || 0),
    likes_count: Number(p.likes_count || 0),
    is_featured: Boolean(p.is_featured),
    is_new_arrival: Boolean(p.is_new_arrival),
    is_offer: Boolean(p.is_offer),
    is_out_of_stock: Boolean(p.is_out_of_stock),
  };
}

function formatCategory(c) {
  if (!c) return null;
  return {
    ...c,
    id: Number(c.id),
    display_order: Number(c.display_order || 0),
    is_active: Boolean(c.is_active),
  };
}

function formatOffer(o) {
  if (!o) return null;
  return {
    ...o,
    id: Number(o.id),
    is_active: Boolean(o.is_active),
  };
}

async function attachImagesAndVariants(products) {
  if (!products || products.length === 0) return [];
  const ids = products.map(p => p.id);

  const images = await db('product_images')
    .whereIn('product_id', ids)
    .andWhere('image_type', 'main');

  const variants = await db('product_variants')
    .whereIn('product_id', ids);

  const imageMap = {};
  images.forEach(img => {
    if (!imageMap[img.product_id]) {
      imageMap[img.product_id] = img.image_path;
    }
  });

  const variantMap = {};
  variants.forEach(v => {
    if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
    variantMap[v.product_id].push({
      ...v,
      id: Number(v.id),
      product_id: Number(v.product_id),
      stock: Number(v.stock || 0)
    });
  });

  return products.map(p => {
    const formatted = formatProduct(p);
    formatted.main_image = imageMap[p.id] || null;
    formatted.variants = variantMap[p.id] || [];
    return formatted;
  });
}

module.exports = {
  db,
  initDb,
  formatProduct,
  formatCategory,
  formatOffer,
  attachImagesAndVariants
};
