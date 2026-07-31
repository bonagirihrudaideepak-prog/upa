<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Debug Info</h2>";

echo "<h3>REQUEST_URI</h3>";
echo "Original: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "<br>";
echo "From GET[route]: " . ($_GET['route'] ?? 'N/A') . "<br>";

echo "<h3>PHP Info</h3>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "Session path: " . session_save_path() . "<br>";
echo "Session status: " . (session_status() === PHP_SESSION_NONE ? 'NONE' : session_status() === PHP_SESSION_ACTIVE ? 'ACTIVE' : 'DISABLED') . "<br>";

echo "<h3>Database Test</h3>";
$env = parse_ini_file(__DIR__ . '/backend/.env');
echo "DB_HOST: " . ($env['DB_HOST'] ?? 'N/A') . "<br>";
echo "DB_NAME: " . ($env['DB_NAME'] ?? 'N/A') . "<br>";
echo "DB_USER: " . ($env['DB_USER'] ?? 'N/A') . "<br>";

try {
    $pdo = new PDO(
        "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4",
        $env['DB_USER'],
        $env['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "DB: Connected!<br>";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "<br>";
    
    $admins = $pdo->query("SELECT * FROM admin_users")->fetchAll();
    echo "Admin users: " . count($admins) . "<br>";
    foreach ($admins as $a) {
        echo "- {$a['username']} (hash: " . substr($a['password_hash'], 0, 20) . "...)<br>";
    }
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "<br>";
}

echo "<h3>Session Test</h3>";
session_start();
$_SESSION['test'] = time();
echo "Session ID: " . session_id() . "<br>";
echo "Session data: " . print_r($_SESSION, true) . "<br>";

echo "<h3>File Structure</h3>";
echo "index.php exists: " . (file_exists(__DIR__ . '/index.php') ? 'Yes' : 'No') . "<br>";
echo "backend/index.php exists: " . (file_exists(__DIR__ . '/backend/index.php') ? 'Yes' : 'No') . "<br>";
echo "frontend/dist/index.html exists: " . (file_exists(__DIR__ . '/frontend/dist/index.html') ? 'Yes' : 'No') . "<br>";
echo "backend/.env exists: " . (file_exists(__DIR__ . '/backend/.env') ? 'Yes' : 'No') . "<br>";
