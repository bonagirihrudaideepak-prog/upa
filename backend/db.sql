CREATE DATABASE IF NOT EXISTS `upanishad_store`;
USE `upanishad_store`;

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
);

CREATE TABLE IF NOT EXISTS `product_images` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `image_path` VARCHAR(255) NOT NULL,
    `image_type` ENUM('main', 'alt') DEFAULT 'main',
    `is_original_1_1` BOOLEAN DEFAULT FALSE,
    `is_original_3_4` BOOLEAN DEFAULT FALSE,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `product_variants` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `color_code` VARCHAR(7) NOT NULL,
    `model` VARCHAR(100),
    `stock` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `offers` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `image_path` VARCHAR(255),
    `link` VARCHAR(255),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) UNIQUE,
    `description` TEXT,
    `is_active` BOOLEAN DEFAULT TRUE,
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS `reviews` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT UNSIGNED NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `comment` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `categories` (`name`, `slug`, `description`) VALUES
    ('Electronics', 'electronics', 'Electronic devices and accessories'),
    ('Clothing', 'clothing', 'Clothing and apparel'),
    ('Home', 'home', 'Home goods and decor'),
    ('Beauty', 'beauty', 'Beauty and wellness products'),
    ('Accessories', 'accessories', 'Fashion accessories'),
    ('Gadgets', 'gadgets', 'Tech gadgets and devices'),
    ('Others', 'others', 'Other products');

INSERT INTO `admin_users` (`username`, `password_hash`) VALUES
    ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
