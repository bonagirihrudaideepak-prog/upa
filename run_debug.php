<?php
$logFile = __DIR__ . '/uploads/debug_output.txt';

ob_start();
echo "=== Upanishad Store Debug ===\n\n";

// 1. Environment
echo "--- Environment ---\n";
$envPath = __DIR__ . '/backend/.env';
echo ".env exists: " . (file_exists($envPath) ? 'YES' : 'NO') . "\n";
$env = file_exists($envPath) ? parse_ini_file($envPath) : [];
foreach ($env as $k => $v) {
    $val = (in_array($k, ['DB_PASS', 'ADMIN_PASSWORD'])) ? '***' : $v;
    echo "  $k = $val\n";
}

// 2. Database
echo "\n--- Database ---\n";
try {
    $pdo = new PDO(
        "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4",
        $env['DB_USER'], $env['DB_PASS'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    echo "Connected: YES\n";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "\n";
    $admin = $pdo->query("SELECT username, password_hash FROM admin_users WHERE username = 'admin'")->fetch();
    if ($admin) {
        $pw = $env['ADMIN_PASSWORD'] ?? 'admin123';
        $ok = password_verify($pw, $admin['password_hash']);
        echo "Admin password verify: " . ($ok ? 'PASS' : 'FAIL') . "\n";
        if (!$ok) {
            $newHash = password_hash($pw, PASSWORD_BCRYPT);
            $pdo->exec("UPDATE admin_users SET password_hash = '$newHash' WHERE username = 'admin'");
            echo "Password hash UPDATED\n";
        }
    }
    $count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    echo "Products: $count\n";
    $count = $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    echo "Categories: $count\n";
    $count = $pdo->query("SELECT COUNT(*) FROM offers")->fetchColumn();
    echo "Offers: $count\n";
} catch (Exception $e) {
    echo "DB ERROR: " . $e->getMessage() . "\n";
}

// 3. PHP info
echo "\n--- PHP ---\n";
echo "PHP Version: " . PHP_VERSION . "\n";
echo "PDO MySQL: " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
echo "Session path: " . session_save_path() . "\n";
echo "Session writeable: " . (is_writable(session_save_path()) ? 'YES' : 'NO') . "\n";

// 4. Test backend routing
echo "\n--- Backend Routing ---\n";
try {
    define('APP_NAME', 'Upanishad Store API');
    define('BASE_PATH', __DIR__ . '/backend');
    spl_autoload_register(function ($class) {
        $dirs = ['app/models', 'app/controllers', 'app/services', 'app/middleware'];
        foreach ($dirs as $dir) {
            $file = BASE_PATH . '/' . $dir . '/' . $class . '.php';
            if (file_exists($file)) { require $file; return; }
        }
    });
    require BASE_PATH . '/app/HttpKernel.php';
    require BASE_PATH . '/app/Response.php';
    
    $tests = [
        ['GET', '/api/products', '/api/products'],
        ['GET', '/api/categories', '/api/categories'],
        ['GET', '/api/offers', '/api/offers'],
        ['GET', '/api/products/featured', '/api/products/featured'],
    ];
    
    foreach ($tests as $t) {
        $_SERVER['REQUEST_METHOD'] = $t[0];
        $_SERVER['REQUEST_URI'] = $t[1];
        $_GET['route'] = ltrim($t[1], '/');
        try {
            ob_start();
            $k = new HttpKernel();
            $k->run();
            $out = ob_get_clean();
            $j = json_decode($out, true);
            echo "  {$t[0]} {$t[1]}: " . ($j ? 'OK (JSON)' : 'NOT JSON') . "\n";
            if (!$j) echo "    Response: " . substr($out, 0, 150) . "\n";
        } catch (Exception $e) {
            ob_clean();
            echo "  {$t[0]} {$t[1]}: ERROR - " . $e->getMessage() . "\n";
        }
    }
    
    // Test login
    echo "\n--- Login Test ---\n";
    try {
        $auth = new AuthService();
        $r = $auth->login('admin', $env['ADMIN_PASSWORD'] ?? 'admin123');
        echo "  Login: " . ($r ? 'SUCCESS' : 'FAILED') . "\n";
    } catch (Exception $e) {
        echo "  Login ERROR: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "Bootstrap ERROR: " . $e->getMessage() . "\n";
}

$output = ob_get_clean();
file_put_contents($logFile, $output);
echo "Debug output written to: $logFile\n";
echo "Output:\n$output";
