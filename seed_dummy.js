const { db, initDb } = require('./db');

// Different aspect ratios & sizes to test rendering across all UI surfaces.
const RATIOS = [
  { key: '1-1',   w: 800,  h: 800,  label: '1:1 Square',       is_original_1_1: true,  is_original_3_4: false },
  { key: '3-4',   w: 600,  h: 800,  label: '3:4 Portrait',     is_original_1_1: false, is_original_3_4: true  },
  { key: '4-5',   w: 800,  h: 1000, label: '4:5 Portrait',     is_original_1_1: false, is_original_3_4: true  },
  { key: '4-3',   w: 800,  h: 600,  label: '4:3 Landscape',    is_original_1_1: false, is_original_3_4: false },
  { key: '16-9',  w: 1280, h: 720,  label: '16:9 Wide',        is_original_1_1: false, is_original_3_4: false },
  { key: '9-16',  w: 720,  h: 1280, label: '9:16 Tall',        is_original_1_1: false, is_original_3_4: false },
  { key: '1-2',   w: 500,  h: 1000, label: '1:2 Tall Banner',  is_original_1_1: false, is_original_3_4: false },
  { key: '2-1',   w: 1000, h: 500,  label: '2:1 Wide Banner',  is_original_1_1: false, is_original_3_4: false },
];

// Deterministic image of an exact size so every ratio can be verified.
function img(seed, w, h) {
  return `https://picsum.photos/seed/upanishad-${seed}/${w}/${h}`;
}

function mainImageFor(i) {
  const r = RATIOS[i % RATIOS.length];
  return { ...r, url: img('main-' + i, r.w, r.h) };
}

// Gallery images use the *next* ratios so each product tests several layouts.
function galleryImagesFor(i) {
  const a = RATIOS[(i + 1) % RATIOS.length];
  const b = RATIOS[(i + 2) % RATIOS.length];
  return [
    { ...a, url: img('g1-' + i, a.w, a.h) },
    { ...b, url: img('g2-' + i, b.w, b.h) },
  ];
}

const iphoneModels = [
  'iPhone 17 Pro Max 256GB', 'iPhone 17 Pro 128GB', 'iPhone 17 Plus', 'iPhone 17 Slim Edition',
  'iPhone 16 Pro Max 512GB', 'iPhone 16 Pro 256GB', 'iPhone 16 Plus 128GB', 'iPhone 16 128GB',
  'iPhone 15 Pro Max Natural', 'iPhone 15 Pro Blue Titanium', 'iPhone 15 Pink 128GB', 'iPhone 15 Black',
  'iPhone 14 Pro Max Deep Purple', 'iPhone 14 Pro 128GB', 'iPhone 14 Starlight'
];

const samsungModels = [
  'Samsung Galaxy S25 Ultra 5G', 'Samsung Galaxy S25+ Titanium', 'Samsung Galaxy S25 Mint',
  'Samsung Galaxy Z Fold 6 512GB', 'Samsung Galaxy Z Flip 6 Cream', 'Samsung Galaxy S24 Ultra 256GB',
  'Samsung Galaxy S24+ Violet', 'Samsung Galaxy S24 Amber Yellow', 'Samsung Galaxy S23 FE 5G',
  'Samsung Galaxy A55 5G Awesome Iceblue', 'Samsung Galaxy A35 5G Navy', 'Samsung Galaxy A15 5G Blue Black',
  'Samsung Galaxy M55 5G Denim', 'Samsung Galaxy F55 5G Apricot', 'Samsung Galaxy S22 Ultra Phantom'
];

const accessoriesList = [
  'MagSafe Premium Matte Leather Case', 'Customized Photo Printed Glass Cover', 'Matte Anti-Fingerprint Armor Case',
  'Ultra-Clear TPU Protection Case', '9H Hardness Tempered Glass Shield', 'Privacy Matte Screen Protector',
  'Metal Camera Lens Ring Guard', 'Heavy Duty Kickstand Armor Case', 'Carbon Fiber Slim Texture Cover',
  'Glitter Diamond Bling Case', 'Silicone Soft Touch Back Cover', 'Magnetic Ring Stand Holder Case',
  'Transparent Gradient Aurora Cover', 'Fabric Canvas Protective Case', 'Sleek Flip Wallet Leather Pouch',
  'Shockproof Bumper Protection Cover', 'Hydrogel Full Curved Screen Guard', 'Speaker Dustproof Mesh Guard',
  'Wrist Strap Lanyard Silicone Cover', 'Luxury Electroplated Chrome Case'
];

const gadgetsList = [
  'Wireless ANC Earbuds Pro 2', '65W GaN Dual USB-C Fast Charger', 'Ultra Smartwatch 2.0 HD Display',
  '20000mAh Power Bank 22.5W', 'Magnetic Wireless Charging Pad 15W', 'TWS Neckband Wireless Earphones',
  'RGB Bluetooth Gaming Speaker', 'Car Dashboard Magnetic Phone Mount', 'Braided Type-C Fast Charge Cable 2m',
  'Lightning to 3.5mm Aux Adapter', 'Fitness Smart Band Pulse Tracker', 'Portable Handheld Gimbal Stabilizer',
  'Active Noise Cancelling Headphones', '100W PD Braided Fast Cable', 'Wireless Lavalier Collar Microphone',
  'USB-C Multi-port Hub 7-in-1', 'FM Transmitter Bluetooth Car Kit', 'Fast Charging Car Charger 45W',
  'Mini Waterproof Pocket BT Speaker', 'Stylus Touch Pen for iPad & Android'
];

const otherBrands = [
  ['OnePlus 12 5G (Silky Black, 256GB)', 'OnePlus'],
  ['Google Pixel 9 Pro 128GB Obsidian', 'Google Pixel'],
  ['Xiaomi 14 Ultra (512GB, White)', 'Xiaomi'],
  ['Vivo X100 Pro 5G (Asteroid Black)', 'Vivo'],
  ['iQOO 12 5G (Legend Edition)', 'iQOO'],
  ['Realme GT 6 5G (Fluid Silver)', 'Realme'],
  ['Motorola Edge 50 Ultra 5G', 'Motorola'],
  ['Nothing Phone (2a) Plus (128GB)', 'Nothing'],
  ['Poco F6 Pro 5G (Black 256GB)', 'Poco'],
  ['Asus ROG Phone 8 Pro Gaming', 'Asus'],
  ['Honor Magic 6 Pro 5G', 'Honor'],
  ['OnePlus Nord 4 5G Mercurial', 'OnePlus'],
  ['Redmi Note 13 Pro+ 5G Purple', 'Redmi'],
  ['Realme 13 Pro 5G Monet Gold', 'Realme'],
  ['Oppo Reno 12 Pro 5G Space Brown', 'Oppo'],
  ['Vivo V40 Pro 5G Ganges Blue', 'Vivo'],
  ['Tecno Phantom V Fold 5G', 'Tecno'],
  ['Infinix Zero 40 5G Violet', 'Infinix'],
  ['Google Pixel 8a Mint 128GB', 'Google Pixel'],
  ['OnePlus Open Foldable 5G', 'OnePlus'],
  ['Xiaomi Redmi Turbo 4 5G', 'Xiaomi'],
  ['Asus Zenfone 11 Ultra', 'Asus'],
  ['Motorola Razr 50 Ultra', 'Motorola'],
  ['Nothing Phone (2) 256GB', 'Nothing'],
  ['iQOO Neo 9 Pro 5G', 'iQOO'],
  ['Oppo Find X8 Pro 5G', 'Oppo'],
  ['Vivo T3 Ultra 5G', 'Vivo'],
  ['Poco X7 Pro 5G', 'Poco'],
  ['Honor 200 Pro 5G', 'Honor'],
  ['Infinix Note 40 Pro 5G', 'Infinix']
];

const colorVariants = [
  { color: 'Titanium', code: '#8c8f94' },
  { color: 'Midnight', code: '#1c1c1e' },
  { color: 'Starlight', code: '#f5f0e6' },
  { color: 'Blue', code: '#2f6fed' },
  { color: 'Green', code: '#34a853' },
  { color: 'Red', code: '#e02020' },
  { color: 'Purple', code: '#7b2fbe' },
  { color: 'Silver', code: '#d7d9dc' },
];

async function seedDummyProducts() {
  await initDb();
  console.log('Clearing existing demo products...');
  await db('product_images').del();
  await db('product_variants').del();
  await db('reviews').del();
  await db('products').del();

  let count = 0;
  let ratioTally = {};

  async function insertProduct({ name, sku, price, category, description, stock, featured, isOffer }) {
    const r = mainImageFor(count);
    const gallery = galleryImagesFor(count);
    ratioTally[r.label] = (ratioTally[r.label] || 0) + 1;

    const [inserted] = await db('products').insert({
      name,
      description,
      sku,
      price,
      category,
      stock,
      is_featured: featured,
      is_new_arrival: count % 3 === 0,
      is_offer: isOffer,
      is_out_of_stock: count % 7 === 5,
      likes_count: 30 + (count * 13)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;

    await db('product_images').insert({
      product_id: pId,
      image_path: r.url,
      image_type: 'main',
      is_original_1_1: r.is_original_1_1,
      is_original_3_4: r.is_original_3_4,
      display_order: 0
    });

    gallery.forEach((g, gi) => {
      db('product_images').insert({
        product_id: pId,
        image_path: g.url,
        image_type: 'additional',
        is_original_1_1: g.is_original_1_1,
        is_original_3_4: g.is_original_3_4,
        display_order: gi + 1
      });
    });

    if (count % 2 === 0) {
      const picks = colorVariants.slice(0, 2 + (count % 3));
      for (const v of picks) {
        db('product_variants').insert({
          product_id: pId,
          color: v.color,
          color_code: v.code,
          model: name,
          stock: 5
        });
      }
    }

    count++;
  }

  // 1. iPhone (15)
  for (let i = 0; i < iphoneModels.length; i++) {
    const name = iphoneModels[i];
    await insertProduct({
      name,
      sku: `IPH-${100 + i}`,
      price: 49999 + (14 - i) * 3500,
      category: 'iPhone',
      description: `Original ${name} with official store takeaway warranty and genuine packaging.`,
      stock: 12,
      featured: i < 8,
      isOffer: i % 2 === 0
    });
  }

  // 2. Samsung (15)
  for (let i = 0; i < samsungModels.length; i++) {
    const name = samsungModels[i];
    await insertProduct({
      name,
      sku: `SAM-${100 + i}`,
      price: 24999 + (14 - i) * 3000,
      category: 'Samsung',
      description: `Official ${name} with official Samsung warranty & instant takeaway.`,
      stock: 15,
      featured: i < 8,
      isOffer: i % 3 === 0
    });
  }

  // 3. Accessories (20)
  for (let i = 0; i < accessoriesList.length; i++) {
    const name = accessoriesList[i];
    await insertProduct({
      name,
      sku: `ACC-${100 + i}`,
      price: 399 + (i * 80),
      category: 'Accessories',
      description: `Premium grade ${name} with high durability and precise cutouts.`,
      stock: 50,
      featured: i < 8,
      isOffer: i % 2 === 1
    });
  }

  // 4. Gadgets (20)
  for (let i = 0; i < gadgetsList.length; i++) {
    const name = gadgetsList[i];
    await insertProduct({
      name,
      sku: `GAD-${100 + i}`,
      price: 699 + (i * 250),
      category: 'Gadgets',
      description: `Next-gen ${name} featuring fast charge and intelligent battery management.`,
      stock: 30,
      featured: i < 8,
      isOffer: i % 3 === 1
    });
  }

  // 5. Others - all remaining brands (30)
  for (let i = 0; i < otherBrands.length; i++) {
    const [name, brand] = otherBrands[i];
    await insertProduct({
      name,
      sku: `OTH-${100 + i}`,
      price: 22999 + (i * 2500),
      category: 'Others',
      description: `Flagship ${brand} ${name} with complete accessories package & store warranty.`,
      stock: 10,
      featured: i < 8,
      isOffer: i % 2 === 0
    });
  }

  console.log(`\nSuccessfully populated ${count} products!`);
  console.log('Main-image ratio breakdown:');
  for (const [label, n] of Object.entries(ratioTally)) {
    console.log(`  ${label.padEnd(16)} x${n}`);
  }
  console.log('\nEvery product has 1 main + 2 gallery images at DIFFERENT aspect ratios.');
  process.exit(0);
}

seedDummyProducts().catch(e => {
  console.error(e);
  process.exit(1);
});
