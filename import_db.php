<?php
$envPath = __DIR__ . '/backend/.env';
$sqlPath = __DIR__ . '/backend/db.sql';

echo "<h1>Upanishad Store — Database Import</h1>";

if (!file_exists($envPath)) {
    echo "<p style='color:red'>Error: backend/.env not found. Run dashboard_setup.php first.</p>";
    exit;
}

$env = parse_ini_file($envPath);
$host = $env['DB_HOST'] ?? '';
$dbname = $env['DB_NAME'] ?? '';
$user = $env['DB_USER'] ?? '';
$pass = $env['DB_PASS'] ?? '';

if (empty($host) || empty($dbname)) {
    echo "<p style='color:red'>Error: Missing database credentials in .env</p>";
    exit;
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo "<p style='color:green'>✓ Connected to MySQL: $host / $dbname</p>";
} catch (PDOException $e) {
    echo "<p style='color:red'>✗ Connection failed: " . $e->getMessage() . "</p>";
    exit;
}

if (file_exists($sqlPath)) {
    $sql = file_get_contents($sqlPath);
    echo "<p>Found db.sql (" . strlen($sql) . " bytes)</p>";

    $sql = preg_replace('/CREATE DATABASE[^;]+;/', '', $sql);
    $sql = preg_replace('/USE [^;]+;/', '', $sql);

    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $count = 0;
    $errors = [];

    foreach ($statements as $stmt) {
        if (!empty($stmt) && !str_starts_with($stmt, '--')) {
            try {
                $pdo->exec($stmt);
                $count++;
            } catch (PDOException $e) {
                $errors[] = htmlspecialchars($e->getMessage());
            }
        }
    }

    echo "<p style='color:green'>✓ $count SQL statements executed.</p>";

    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "<p style='color:green'>✓ Tables: " . implode(', ', $tables) . "</p>";

    if (!empty($errors)) {
        echo "<p style='color:orange'>⚠ " . count($errors) . " warnings:</p><ul>";
        foreach ($errors as $e) echo "<li>$e</li>";
        echo "</ul>";
    }

    // Check if admin user exists
    $admins = $pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
    echo "<p style='color:green'>✓ Admin users: $admins</p>";

    echo "<hr><p><a href='/'>Go to Store</a> | <a href='/api/admin/login'>Admin Login</a></p>";
    echo "<p><strong>Admin credentials:</strong> admin / admin123</p>";
} else {
    echo "<p style='color:red'>✗ db.sql not found at $sqlPath</p>";
}
