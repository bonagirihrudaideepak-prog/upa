-- ========================================================
-- Hostinger MySQL Database Schema & Seed Data for Upanishad Store
-- ========================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) UNIQUE,
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `sku` VARCHAR(50) UNIQUE,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `stock` INT DEFAULT 0,
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_new_arrival` BOOLEAN DEFAULT FALSE,
    `is_offer` BOOLEAN DEFAULT FALSE,
    `is_out_of_stock` BOOLEAN DEFAULT FALSE,
    `likes_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Product Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `image_type` ENUM('main', 'alt') DEFAULT 'main',
    `is_original_1_1` BOOLEAN DEFAULT FALSE,
    `is_original_3_4` BOOLEAN DEFAULT FALSE,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `color_code` VARCHAR(20) NOT NULL,
    `model` VARCHAR(100),
    `stock` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Offers Table
CREATE TABLE IF NOT EXISTS `offers` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `image_path` VARCHAR(255),
    `link` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `comment` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Admin Users Table
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Site Settings Table
CREATE TABLE IF NOT EXISTS `site_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEED DATA
-- ========================================================

-- Site Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`) VALUES
('store_name', 'Upanishad Mobile Store'),
('marquee_text', '⚡ Welcome to Upanishad Mobile Store! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡'),
('contact_phone', '+91 96667 31286'),
('whatsapp_number', '+919666731286'),
('instagram_url', 'https://www.instagram.com/upanishadmobiles/'),
('location_map_url', 'https://maps.app.goo.gl/JRej6So64iYYm7ia6'),
('hero_title', 'Modern Tech, Curated for You'),
('hero_subtitle', 'Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- Admin User: Test123admin01 / Flipkartzon01123
INSERT INTO `admin_users` (`username`, `password_hash`) VALUES
('Test123admin01', '$2y$10$e0MYzXyjpJS7Pd0RVvHwHe4X8lQ/7eGZ4P0h.wZ5/V6eQ6yK6Zg6m')
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`);

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `display_order`, `is_active`) VALUES
(1, 'iPhone', 'iphone', 'Apple iPhone devices and covers', 1, 1),
(2, 'Samsung', 'samsung', 'Samsung smartphones and covers', 2, 1),
(3, 'Oppo', 'oppo', 'Oppo smartphones and accessories', 3, 1),
(4, 'Vivo', 'vivo', 'Vivo smartphones and accessories', 4, 1),
(5, 'Cases', 'cases', 'Covers, back cases & pouches', 5, 1),
(6, 'Screen Guards', 'screen-guards', 'Tempered glass & screen protectors', 6, 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `slug`=VALUES(`slug`), `description`=VALUES(`description`);

-- Dummy Products
INSERT INTO `products` (`id`, `name`, `description`, `sku`, `price`, `category`, `stock`, `is_featured`, `is_new_arrival`, `is_offer`, `is_out_of_stock`, `likes_count`) VALUES
(1, 'iPhone 17 Pro Max', 'The flagship iPhone with A19 Pro chip, titanium design, and revolutionary camera system.', 'IP17PM-256', 134999.00, 'Electronics', 15, 1, 1, 0, 0, 1420),
(2, 'Samsung Galaxy S25 Ultra', 'Galaxy AI powered flagship smartphone with integrated S-Pen and 200MP Quad Tele camera.', 'SGS25U-512', 129999.00, 'Electronics', 12, 1, 1, 1, 0, 2150),
(3, 'MagSafe Premium Matte Leather Case', 'Premium shockproof matte leather back cover with strong built-in MagSafe magnetic ring.', 'MAG-LTR-01', 1499.00, 'Accessories', 50, 1, 0, 1, 0, 3890),
(4, 'Wireless Noise Cancelling Earbuds Pro', 'Active Noise Cancellation (ANC), 36-hour total battery life, HD Spatial Audio, and IPX5 water resistance.', 'ANC-EAR-PRO', 4999.00, 'Gadgets', 30, 1, 1, 0, 0, 1850),
(5, 'Fast Charging 65W GaN Dual Adapter', 'Ultra-compact 65W Gallium Nitride fast charger for iPhone, Samsung, MacBooks, and Android devices.', 'GAN-65W-CHG', 2199.00, 'Gadgets', 45, 0, 1, 1, 0, 940),
(6, 'Customized Photo Printed Glass Cover', '9H tempered glass back cover customized with your personal photo, design, or name engraving.', 'CUST-GLASS-01', 799.00, 'Accessories', 100, 1, 1, 1, 0, 5120),
(7, 'Smart Fitness Watch Ultra', '1.96-inch AMOLED display, Bluetooth calling, SpO2 & Heart Rate monitoring, 100+ sports modes.', 'SWT-ULT-01', 3499.00, 'Gadgets', 20, 0, 0, 1, 0, 1250)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Product Images
INSERT INTO `product_images` (`product_id`, `image_path`, `image_type`, `display_order`) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 'main', 0),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 'main', 0),
(3, 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800', 'main', 0),
(4, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 'main', 0),
(5, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'main', 0),
(6, 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800', 'main', 0),
(7, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 'main', 0);

-- Product Variants
INSERT INTO `product_variants` (`product_id`, `color`, `color_code`, `model`, `stock`) VALUES
(1, 'Natural Titanium', '#bebaa7', 'iPhone 17 Pro Max 256GB', 10),
(1, 'Deep Blue', '#2c3e50', 'iPhone 17 Pro Max 512GB', 5),
(2, 'Titanium Gray', '#708090', 'Galaxy S25 Ultra 512GB', 8),
(2, 'Titanium Black', '#1c1c1c', 'Galaxy S25 Ultra 1TB', 4),
(3, 'Saddle Brown', '#8B4513', 'iPhone 16 Pro', 25),
(3, 'Midnight Black', '#000000', 'iPhone 15 Pro Max', 25),
(4, 'Glossy White', '#FFFFFF', 'Standard ANC', 20),
(4, 'Matte Black', '#121212', 'Pro Edition ANC', 10),
(5, 'Pure White', '#F8F9FA', 'Dual Port 65W GaN', 45),
(6, 'Glass Print', '#333333', 'iPhone 16 / 15 / Samsung S24', 100),
(7, 'Ocean Orange', '#FF6F00', '49mm Titanium Style', 10),
(7, 'Tactical Black', '#212121', '49mm Black Style', 10);

-- Offers / Banners
INSERT INTO `offers` (`title`, `description`, `image_path`, `link`, `is_active`) VALUES
('Mega Monsoon Sale - Up to 50% Off Mobile Accessories', 'Grab premium iPhone & Samsung cases, screen guards, and fast chargers at unbeatable prices!', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', '/catalog?filter=offers', 1),
('Customized Phone Covers Booking Open!', 'Print your photo, name, or custom art on premium toughened glass covers. Fast store pickup!', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200', '/customization', 1),
('New Arrival: iPhone 17 & Galaxy S25 Accessories in Stock', 'Visit Deepak Electronics for exclusive covers, tempered glass, and camera lens protectors!', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200', '/catalog', 1);

-- Reviews
INSERT INTO `reviews` (`product_id`, `user_name`, `rating`, `comment`) VALUES
(1, 'Rahul K.', 5, 'Excellent quality and super fast in-store pickup! Highly recommended.'),
(3, 'Sneha M.', 5, 'The leather feel is awesome and MagSafe magnet is very strong.'),
(6, 'Vikas P.', 5, 'Custom photo print looks crystal clear on glass! Loved it.');
