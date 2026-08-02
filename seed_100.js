const { db, initDb } = require('./db');

async function seed100Products() {
  await initDb();
  console.log('Clearing existing demo products...');
  await db('product_images').del();
  await db('product_variants').del();
  await db('reviews').del();
  await db('products').del();

  const iphoneModels = [
    'iPhone 17 Pro Max 256GB', 'iPhone 17 Pro 128GB', 'iPhone 17 Plus', 'iPhone 17 Slim Edition',
    'iPhone 16 Pro Max 512GB', 'iPhone 16 Pro 256GB', 'iPhone 16 Plus 128GB', 'iPhone 16 128GB',
    'iPhone 15 Pro Max Natural', 'iPhone 15 Pro Blue Titanium', 'iPhone 15 Pink 128GB', 'iPhone 15 Black',
    'iPhone 14 Pro Max Deep Purple', 'iPhone 14 Pro 128GB', 'iPhone 14 Starlight', 'iPhone 13 Midnight 128GB',
    'iPhone SE 3rd Gen 64GB', 'iPhone 12 Pro Pacific Blue', 'iPhone 12 White 64GB', 'iPhone 11 Product Red'
  ];

  const samsungModels = [
    'Samsung Galaxy S25 Ultra 5G', 'Samsung Galaxy S25+ Titanium', 'Samsung Galaxy S25 Mint',
    'Samsung Galaxy Z Fold 6 512GB', 'Samsung Galaxy Z Flip 6 Cream', 'Samsung Galaxy S24 Ultra 256GB',
    'Samsung Galaxy S24+ Violet', 'Samsung Galaxy S24 Amber Yellow', 'Samsung Galaxy S23 FE 5G',
    'Samsung Galaxy A55 5G Awesome Iceblue', 'Samsung Galaxy A35 5G Navy', 'Samsung Galaxy A15 5G Blue Black',
    'Samsung Galaxy M55 5G Denim', 'Samsung Galaxy F55 5G Apricot', 'Samsung Galaxy S22 Ultra Phantom',
    'Samsung Galaxy Z Fold 5 256GB', 'Samsung Galaxy Z Flip 5 Lavender', 'Samsung Galaxy S21 FE 5G Olive',
    'Samsung Galaxy A54 5G Lime', 'Samsung Galaxy M34 5G Prism Silver'
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

  const othersList = [
    'OnePlus 12 5G (Silky Black, 256GB)', 'Google Pixel 9 Pro 128GB Obsidian', 'Xiaomi 14 Ultra (512GB, White)',
    'Vivo X100 Pro 5G (Asteroid Black)', 'iQOO 12 5G (Legend Edition)', 'Realme GT 6 5G (Fluid Silver)',
    'Motorola Edge 50 Ultra 5G', 'Nothing Phone (2a) Plus (128GB)', 'Poco F6 Pro 5G (Black 256GB)',
    'Asus ROG Phone 8 Pro Gaming', 'Honor Magic 6 Pro 5G', 'OnePlus Nord 4 5G Mercurial',
    'Redmi Note 13 Pro+ 5G Purple', 'Realme 13 Pro 5G Monet Gold', 'Oppo Reno 12 Pro 5G Space Brown',
    'Vivo V40 Pro 5G Ganges Blue', 'Tecno Phantom V Fold 5G', 'Infinix Zero 40 5G Violet',
    'Google Pixel 8a Mint 128GB', 'OnePlus Open Foldable 5G'
  ];

  let count = 0;

  // 1. iPhone
  for (let i = 0; i < iphoneModels.length; i++) {
    const name = iphoneModels[i];
    const price = 49999 + (20 - i) * 3500;
    const [inserted] = await db('products').insert({
      name,
      description: `Original ${name} with official store takeaway warranty and genuine packaging.`,
      sku: `IPH-10${i + 1}`,
      price,
      category: 'iPhone',
      stock: 12,
      is_featured: i < 8,
      is_new_arrival: i < 8,
      is_offer: i % 2 === 0,
      is_out_of_stock: false,
      likes_count: 50 + (i * 14)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;
    await db('product_images').insert({
      product_id: pId,
      image_path: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop',
      image_type: 'main',
      display_order: 0
    });
    count++;
  }

  // 2. Samsung
  for (let i = 0; i < samsungModels.length; i++) {
    const name = samsungModels[i];
    const price = 24999 + (20 - i) * 3000;
    const [inserted] = await db('products').insert({
      name,
      description: `Official ${name} with official Samsung warranty & instant takeaway.`,
      sku: `SAM-10${i + 1}`,
      price,
      category: 'Samsung',
      stock: 15,
      is_featured: i < 8,
      is_new_arrival: i < 8,
      is_offer: i % 3 === 0,
      is_out_of_stock: false,
      likes_count: 40 + (i * 12)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;
    await db('product_images').insert({
      product_id: pId,
      image_path: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop',
      image_type: 'main',
      display_order: 0
    });
    count++;
  }

  // 3. Accessories
  for (let i = 0; i < accessoriesList.length; i++) {
    const name = accessoriesList[i];
    const price = 399 + (i * 80);
    const [inserted] = await db('products').insert({
      name,
      description: `Premium grade ${name} with high durability and precise cutouts.`,
      sku: `ACC-10${i + 1}`,
      price,
      category: 'Accessories',
      stock: 50,
      is_featured: i < 8,
      is_new_arrival: i < 8,
      is_offer: i % 2 === 1,
      is_out_of_stock: false,
      likes_count: 80 + (i * 15)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;
    await db('product_images').insert({
      product_id: pId,
      image_path: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=600&auto=format&fit=crop',
      image_type: 'main',
      display_order: 0
    });
    count++;
  }

  // 4. Gadgets
  for (let i = 0; i < gadgetsList.length; i++) {
    const name = gadgetsList[i];
    const price = 699 + (i * 250);
    const [inserted] = await db('products').insert({
      name,
      description: `Next-gen ${name} featuring fast charge and intelligent battery management.`,
      sku: `GAD-10${i + 1}`,
      price,
      category: 'Gadgets',
      stock: 30,
      is_featured: i < 8,
      is_new_arrival: i < 8,
      is_offer: i % 3 === 1,
      is_out_of_stock: false,
      likes_count: 65 + (i * 10)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;
    await db('product_images').insert({
      product_id: pId,
      image_path: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop',
      image_type: 'main',
      display_order: 0
    });
    count++;
  }

  // 5. Others
  for (let i = 0; i < othersList.length; i++) {
    const name = othersList[i];
    const price = 22999 + (i * 3500);
    const [inserted] = await db('products').insert({
      name,
      description: `Flagship ${name} with complete accessories package & store warranty.`,
      sku: `OTH-10${i + 1}`,
      price,
      category: 'Others',
      stock: 10,
      is_featured: i < 8,
      is_new_arrival: i < 8,
      is_offer: i % 2 === 0,
      is_out_of_stock: false,
      likes_count: 35 + (i * 9)
    }).returning('id');
    const pId = typeof inserted === 'object' ? inserted.id : inserted;
    await db('product_images').insert({
      product_id: pId,
      image_path: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop',
      image_type: 'main',
      display_order: 0
    });
    count++;
  }

  console.log(`Successfully populated ${count} products (20 per category across 5 categories)!`);
  process.exit(0);
}

seed100Products().catch(e => {
  console.error(e);
  process.exit(1);
});
