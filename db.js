const knex = require('knex');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// ===== In-memory TTL Cache =====
class SimpleCache {
  constructor(ttlMs = 30000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.ts > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data;
  }
  set(key, data) {
    this.cache.set(key, { data, ts: Date.now() });
  }
  invalidate(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
  clear() {
    this.cache.clear();
  }
}
const apiCache = new SimpleCache(30000); // 30s TTL

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

async function ensureColumn(table, column, type) {
  try {
    const cols = await db(table).columnInfo();
    if (!cols[column]) {
      await db.schema.table(table, (t) => {
        if (type === 'text') t.text(column);
        else if (type === 'string') t.string(column, 255);
        else if (type === 'integer') t.integer(column);
        else t.text(column);
      });
      console.log(`[DB] Added "${column}" column to "${table}" table`);
    }
  } catch (err) {
    console.error(`[DB] Error ensuring "${column}" on "${table}":`, err.message || err);
  }
}

// PostgreSQL/MySQL reject values longer than the column length. External image URLs
// (e.g. Apple storeimages, e-commerce CDNs) regularly exceed 255 chars, so we widen
// image_path columns to TEXT. SQLite ignores column lengths and has limited ALTER
// support, so failing there is harmless.
async function widenImagePathColumns() {
  const candidates = [
    { tableName: 'product_images', columnName: 'image_path' },
    { tableName: 'offers', columnName: 'image_path' },
    { tableName: 'categories', columnName: 'image_path' },
  ];
  for (const { tableName, columnName } of candidates) {
    try {
      if (!(await db.schema.hasTable(tableName))) continue;
      await db.schema.alterTable(tableName, (table) => {
        table.text(columnName).alter();
      });
      console.log(`[DB] Widened "${tableName}.${columnName}" to TEXT`);
    } catch (err) {
      // SQLite can't natively alter a column type — fine, lengths are not enforced there.
      const msg = String((err && err.message) || err).toLowerCase();
      if (msg.includes('unsupported alteration') || msg.includes('erbose') || msg.includes('parse error')) {
        continue;
      }
      console.warn(`[DB] Could not widen "${tableName}.${columnName}":`, (err && err.message) || String(err));
    }
  }
}

async function initDb() {
  try {
    // Widen image_path columns to TEXT so long external image URLs (e.g. Apple CDN,
    // which exceed 255 chars) are not rejected/truncated on PostgreSQL/MySQL.
    await widenImagePathColumns();

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

    // Add optional category image column if missing (for existing databases)
    await ensureColumn('categories', 'image_path', 'text');

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
        
        table.index(['category'], 'idx_products_category');
        table.index(['is_featured'], 'idx_products_featured');
        table.index(['is_new_arrival'], 'idx_products_new_arrival');
        table.index(['created_at'], 'idx_products_created_at');
      });
      console.log('[DB] Created "products" table');
    }

    // Optional list of selectable models for a product (e.g. iPhone 17, 17 Pro, 17 Pro Max)
    await ensureColumn('products', 'models', 'text');

    // 3. Product Images
    if (!(await db.schema.hasTable('product_images'))) {
      await db.schema.createTable('product_images', table => {
        table.increments('id').primary();
        table.integer('product_id').unsigned().notNullable().references('id').inTable('products').onDelete('CASCADE');
        table.text('image_path').notNullable();
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
        table.text('image_path');
        table.string('link', 255);
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('[DB] Created "offers" table');
    }

    // Add optional offer caption columns if missing (for existing databases)
    await ensureColumn('offers', 'caption_left', 'text');
    await ensureColumn('offers', 'caption_right', 'text');
    await ensureColumn('offers', 'text_top', 'text');
    await ensureColumn('offers', 'text_bottom', 'text');

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
        { setting_key: 'store_name', setting_value: 'Upanishad mobiles' },
        { setting_key: 'marquee_text', setting_value: '⚡ Welcome to Upanishad mobiles! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡' },
        { setting_key: 'contact_phone', setting_value: '+91 96667 31286' },
        { setting_key: 'whatsapp_number', setting_value: '+919666731286' },
        { setting_key: 'instagram_url', setting_value: 'https://www.instagram.com/upanishadmobiles/' },
        { setting_key: 'location_map_url', setting_value: 'https://maps.app.goo.gl/JRej6So64iYYm7ia6' },
        { setting_key: 'store_address', setting_value: 'Upanishad mobiles, Mobile Point Road, Visakhapatnam, Andhra Pradesh, India' },
        { setting_key: 'contact_email', setting_value: 'upanishadmobiles@gmail.com' },
        { setting_key: 'facebook_url', setting_value: '' },
        { setting_key: 'youtube_url', setting_value: '' },
        { setting_key: 'about_content', setting_value: 'Upanishad mobiles is a trusted local mobile store offering premium smartphones, cases, covers, tempered glass and accessories. We are located in Visakhapatnam and offer store pickup & takeaway only. Message us on WhatsApp for the latest deals and custom phone covers!' },
        { setting_key: 'hero_title', setting_value: 'Modern Tech, Curated for You' },
        { setting_key: 'hero_subtitle', setting_value: 'Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories' },
        { setting_key: 'seo_keywords', setting_value: 'mobile shop Visakhapatnam, smartphone store online, phone covers, tempered glass, iPhone cases, Samsung accessories, new arrival mobiles, best phone deals Andhra Pradesh' },
        { setting_key: 'footer_subtitle', setting_value: 'Store Pickup Only • Premium Smartphones, Cases & Accessories' }
      ]);
      console.log('[DB] Seeded default site settings');
    }

    // Ensure individual settings exist even if the table was seeded before this key was added
    try {
      const missingSettings = [
        { setting_key: 'seo_keywords', setting_value: 'mobile shop Visakhapatnam, smartphone store online, phone covers, tempered glass, iPhone cases, Samsung accessories, new arrival mobiles, best phone deals Andhra Pradesh' },
        { setting_key: 'footer_tagline', setting_value: 'Store Pickup Only • Premium Cases & Accessories' },
        { setting_key: 'pickup_notice', setting_value: 'Store only accepts pickups. Message us on WhatsApp or call to inquire about availability.' },
        { setting_key: 'pickup_label', setting_value: 'Store Pickup Only' },
        { setting_key: 'search_placeholder', setting_value: 'Search Upanishad Mobiles...' },
        { setting_key: 'chat_greeting', setting_value: '👋 Hi! I\'m your AI Shopping Assistant. Ask me about products, prices, colors, or availability!' },
        { setting_key: 'contact_whatsapp_message', setting_value: 'Hi Upanishad Mobile Store, I would like to reserve/order:' },
        { setting_key: 'home_categories_title', setting_value: 'Shop by Category' },
        { setting_key: 'home_featured_title', setting_value: 'Top Recommended' },
        { setting_key: 'home_new_arrivals_title', setting_value: 'New Arrivals' },
        { setting_key: 'home_all_products_title', setting_value: 'All Products' },
        { setting_key: 'footer_copyright', setting_value: 'All rights reserved.' }
      ];
      for (const s of missingSettings) {
        const existing = await db('site_settings').where('setting_key', s.setting_key).first();
        if (!existing) {
          await db('site_settings').insert(s);
          console.log(`[DB] Added default setting "${s.setting_key}"`);
        }
      }
    } catch (err) {
      console.error('[DB] Error ensuring default settings:', err.message || err);
    }

    // Seed default categories if missing
    const catCount = await db('categories').count('id as count').first();
    if (!catCount || parseInt(catCount.count) === 0) {
      await db('categories').insert([
        { name: 'iPhone', slug: 'iphone', description: 'Apple iPhone devices and covers', display_order: 1, is_active: true },
        { name: 'Samsung', slug: 'samsung', description: 'Samsung smartphones and covers', display_order: 2, is_active: true },
        { name: 'All Brands', slug: 'all-brands', description: 'All brand smartphones and covers', display_order: 3, is_active: true },
        { name: 'Accessories', slug: 'accessories', description: 'Covers, cases, tempered glass & protectors', display_order: 4, is_active: true },
        { name: 'Gadgets', slug: 'gadgets', description: 'Smartwatches, earbuds & fast chargers', display_order: 5, is_active: true },
        { name: 'Others', slug: 'others', description: 'Other electronic items & accessories', display_order: 6, is_active: true }
      ]);
      console.log('[DB] Seeded default categories');
    }

    // Note: Dummy product seeding disabled so user modifications persist permanently.

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
function parseModels(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      // Not JSON — treat as comma/newline separated list
      return raw.split(/[,\n]/).map((m) => m.trim()).filter(Boolean);
    }
  }
  return [];
}

function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    id: Number(p.id),
    price: Number(p.price),
    stock: Number(p.stock || 0),
    likes_count: Number(p.likes_count || 0),
    models: parseModels(p.models),
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

  // Fetch ALL images (not just main) — needed for product cards and detail
  const images = await db('product_images')
    .whereIn('product_id', ids)
    .orderBy('display_order', 'asc');

  const variants = await db('product_variants')
    .whereIn('product_id', ids);

  const imageMap = {};
  const fullImageMap = {};
  images.forEach(img => {
    // main_image shortcut (first main image found)
    if (!imageMap[img.product_id] && img.image_type === 'main') {
      imageMap[img.product_id] = img.image_path;
    }
    // full images array
    if (!fullImageMap[img.product_id]) fullImageMap[img.product_id] = [];
    fullImageMap[img.product_id].push({
      ...img,
      id: Number(img.id),
      product_id: Number(img.product_id),
      is_original_1_1: Boolean(img.is_original_1_1),
      is_original_3_4: Boolean(img.is_original_3_4),
      display_order: Number(img.display_order || 0)
    });
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
    formatted.main_image = imageMap[p.id] || (fullImageMap[p.id]?.[0]?.image_path ?? null);
    formatted.images = fullImageMap[p.id] || [];
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
  attachImagesAndVariants,
  apiCache
};
