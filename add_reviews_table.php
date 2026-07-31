<?php
$env = parse_ini_file(__DIR__ . '/backend/.env');
$host = $env['DB_HOST'] ?? 'localhost';
$dbname = $env['DB_NAME'] ?? 'upanishad_store';
$user = $env['DB_USER'] ?? 'root';
$pass = $env['DB_PASS'] ?? '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `reviews` (
            `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `product_id` INT UNSIGNED NOT NULL,
            `user_name` VARCHAR(100) NOT NULL,
            `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
            `comment` TEXT,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        )
    ");

    echo "OK: `reviews` table created.\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
