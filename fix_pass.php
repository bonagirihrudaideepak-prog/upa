<?php
$envPath = __DIR__ . '/backend/.env';
$env = parse_ini_file($envPath);

try {
    $pdo = new PDO(
        "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4",
        $env['DB_USER'],
        $env['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $adminPass = $env['ADMIN_PASSWORD'] ?? 'admin123';
    $hash = password_hash($adminPass, PASSWORD_BCRYPT);
    
    $pdo->exec("UPDATE admin_users SET password_hash = '$hash' WHERE username = 'admin'");
    
    echo "<h1>Admin Password Updated</h1>";
    echo "<p>Username: <strong>admin</strong></p>";
    echo "<p>Password: <strong>$adminPass</strong></p>";
    echo "<p>Hash: $hash</p>";
    echo "<hr><a href='/'>Go to Store</a> | <a href='/api/admin/login'>Admin Login</a>";
} catch (Exception $e) {
    echo "<h1>Error</h1><p>" . $e->getMessage() . "</p>";
}
