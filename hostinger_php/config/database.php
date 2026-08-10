<?php
// Hostinger MySQL Database Connection Configuration

function getDatabaseConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? 'localhost');
        $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? '3306');
        $dbname = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? 'u836516682_upa_db');
        $username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? 'u836516682_upa_usr');
        $password = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? 'UpanishadPass2026!');

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // Auto-initialize tables and seed data if not present
            autoInitDatabase($pdo);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection error',
                'details' => $e->getMessage()
            ]);
            exit;
        }
    }

    return $pdo;
}

function autoInitDatabase(PDO $pdo): void {
    static $initialized = false;
    if ($initialized) return;
    $initialized = true;

    try {
        // 1. Categories
        $pdo->exec("CREATE TABLE IF NOT EXISTS `categories` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `slug` VARCHAR(100) UNIQUE,
            `description` TEXT,
            `image_path` TEXT,
            `is_active` BOOLEAN DEFAULT TRUE,
            `display_order` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        try {
            $pdo->exec("ALTER TABLE `categories` ADD COLUMN `image_path` TEXT AFTER `description`");
        } catch (Exception $e) {}

        // Ensure requested categories exist with featured images
        $desiredCategories = [
            ['name' => 'iPhone',        'slug' => 'iphone',        'description' => 'Apple iPhone smartphones, covers & accessories', 'image' => 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 'order' => 1],
            ['name' => 'Samsung',       'slug' => 'samsung',       'description' => 'Samsung smartphones, cases & accessories',       'image' => 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 'order' => 2],
            ['name' => 'Oppo',          'slug' => 'oppo',          'description' => 'Oppo smartphones & accessories',                'image' => 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'order' => 3],
            ['name' => 'Vivo',          'slug' => 'vivo',          'description' => 'Vivo smartphones & accessories',                'image' => 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'order' => 4],
            ['name' => 'Cases',         'slug' => 'cases',         'description' => 'Premium phone back covers, cases & pouches',     'image' => 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800', 'order' => 5],
            ['name' => 'Screen Guards', 'slug' => 'screen-guards', 'description' => 'Tempered glass, screen guards & lens protectors', 'image' => 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'order' => 6],
        ];

        $stmtCheck = $pdo->prepare("SELECT id FROM categories WHERE slug = ? OR name = ?");
        $stmtInsert = $pdo->prepare("INSERT INTO categories (name, slug, description, image_path, display_order, is_active) VALUES (?, ?, ?, ?, ?, 1)");
        $stmtUpdate = $pdo->prepare("UPDATE categories SET image_path = ?, description = ?, display_order = ? WHERE id = ?");

        foreach ($desiredCategories as $cat) {
            $stmtCheck->execute([$cat['slug'], $cat['name']]);
            $existing = $stmtCheck->fetch();
            if (!$existing) {
                $stmtInsert->execute([$cat['name'], $cat['slug'], $cat['description'], $cat['image'], $cat['order']]);
            } else {
                $stmtUpdate->execute([$cat['image'], $cat['description'], $cat['order'], (int)$existing['id']]);
            }
        }

        // Seed Default Site Settings if missing
        $settingsCount = (int)$pdo->query("SELECT COUNT(*) FROM site_settings")->fetchColumn();
        if ($settingsCount === 0) {
            $pdo->exec("INSERT INTO site_settings (setting_key, setting_value) VALUES
                ('store_name', 'Upanishad mobiles'),
                ('marquee_text', '⚡ Welcome to Upanishad mobiles! Check our WhatsApp (+91 96667 31286) group & status for more deals & custom covers! ⚡'),
                ('contact_phone', '+91 96667 31286'),
                ('whatsapp_number', '+919666731286'),
                ('instagram_url', 'https://www.instagram.com/upanishadmobiles/'),
                ('location_map_url', 'https://maps.app.goo.gl/JRej6So64iYYm7ia6'),
                ('store_address', 'Upanishad mobiles, Mobile Point Road, Visakhapatnam, Andhra Pradesh, India'),
                ('contact_email', 'upanishadmobiles@gmail.com'),
                ('about_content', 'Upanishad mobiles is a trusted local mobile store offering premium smartphones, cases, covers, tempered glass and accessories.'),
                ('hero_title', 'Modern Tech, Curated for You'),
                ('hero_subtitle', 'Store Pickup & Takeaway Only • Premium Smartphones, Cases & Accessories'),
                ('seo_keywords', 'mobile shop Visakhapatnam, smartphone store online, phone covers, tempered glass')");
        }

        // Seed Starter Products if empty
        $productCount = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
        if ($productCount === 0) {
            $pdo->exec("INSERT INTO products (name, description, sku, price, category, stock, is_featured, is_new_arrival, is_offer, is_out_of_stock, likes_count) VALUES
                ('iPhone 17 Pro Max', 'The flagship iPhone with A19 Pro chip, titanium design, and revolutionary camera system.', 'IP17PM-256', 134999.00, 'iPhone', 15, 1, 1, 0, 0, 1420),
                ('Samsung Galaxy S25 Ultra', 'Galaxy AI powered flagship smartphone with integrated S-Pen and 200MP Quad Tele camera.', 'SGS25U-512', 129999.00, 'Samsung', 12, 1, 1, 1, 0, 2150),
                ('Oppo Find X7 Ultra', 'Dual Periscope flagship camera smartphone with Hasselblad color calibration and 120Hz LTPO display.', 'OPPO-FX7U', 74999.00, 'Oppo', 8, 1, 1, 0, 0, 890),
                ('Vivo X100 Pro', 'ZEISS APO Telephoto camera system with V3 imaging chip and Dimensity 9300 chipset.', 'VIVO-X100P', 89999.00, 'Vivo', 10, 1, 1, 0, 0, 960),
                ('MagSafe Premium Leather Case', 'Premium shockproof leather back cover with strong built-in MagSafe magnetic ring.', 'MAG-LTR-01', 1499.00, 'Cases', 50, 1, 1, 1, 0, 3890),
                ('9H Ultra HD Tempered Glass Guard', '9H hardness full coverage tempered glass screen protector with oleophobic anti-fingerprint coating.', 'TG-GUARD-01', 499.00, 'Screen Guards', 100, 1, 1, 1, 0, 4200),
                ('Customized Photo Printed Glass Cover', '9H tempered glass back cover customized with your personal photo, design, or name engraving.', 'CUST-GLASS-01', 799.00, 'Cases', 100, 1, 1, 1, 0, 5120),
                ('Wireless Noise Cancelling Earbuds Pro', 'Active Noise Cancellation (ANC), 36-hour total battery life, HD Spatial Audio, and IPX5 water resistance.', 'ANC-EAR-PRO', 4999.00, 'Electronics', 30, 1, 1, 0, 0, 1850)");

            $pdo->exec("INSERT INTO product_images (product_id, image_path, image_type, display_order) VALUES
                (1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 'main', 0),
                (2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 'main', 0),
                (3, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800', 'main', 0),
                (4, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 'main', 0),
                (5, 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800', 'main', 0),
                (6, 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', 'main', 0),
                (7, 'https://images.unsplash.com/photo-1541877944-ac82a091518a?w=800', 'main', 0),
                (8, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', 'main', 0)");
        }
        // Ensure Admin Users exist (Test123admin01 & admin)
        $passHash1 = password_hash('Flipkartzon01123', PASSWORD_BCRYPT);
        $passHash2 = password_hash('admin123', PASSWORD_BCRYPT);

        $stmt1 = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('Test123admin01', ?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)");
        $stmt1->execute([$passHash1]);

        $stmt2 = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES ('admin', ?) ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)");
        $stmt2->execute([$passHash2]);
    } catch (Exception $e) {
        // Ignore if already existing
    }
}
