<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: text/plain');

echo "=== Upanishad Store API Internal Test ===\n\n";

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
    
    // Check admin password
    $admin = $pdo->query("SELECT username, password_hash FROM admin_users WHERE username = 'admin'")->fetch();
    if ($admin) {
        $pw = $env['ADMIN_PASSWORD'] ?? 'admin123';
        $ok = password_verify($pw, $admin['password_hash']);
        echo "Admin user: {$admin['username']} - password_verify('$pw'): " . ($ok ? 'PASS' : 'FAIL') . "\n";
        if (!$ok) {
            $newHash = password_hash($pw, PASSWORD_BCRYPT);
            $pdo->exec("UPDATE admin_users SET password_hash = '$newHash' WHERE username = 'admin'");
            echo "  -> Password hash updated!\n";
        }
    } else {
        echo "WARNING: No admin user found!\n";
    }
    
    // Count products
    $count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    echo "Products: $count\n";
    $count = $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    echo "Categories: $count\n";
    $count = $pdo->query("SELECT COUNT(*) FROM offers")->fetchColumn();
    echo "Offers: $count\n";
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

// 3. Bootstrap the backend and test routes
echo "\n--- API Routes ---\n";
try {
    // Manually bootstrap
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
    
    // Test routes by simulating requests
    $routes = [
        ['GET', '/api/products', 'List products'],
        ['GET', '/api/categories', 'List categories'],
        ['GET', '/api/offers', 'List offers'],
        ['GET', '/api/products/featured', 'Featured products'],
        ['GET', '/api/products/new-arrivals', 'New arrivals'],
        ['GET', '/api/products/search?q=test', 'Search'],
    ];
    
    foreach ($routes as $route) {
        $method = $route[0];
        $uri = $route[1];
        $desc = $route[2];
        
        $_SERVER['REQUEST_METHOD'] = $method;
        $_SERVER['REQUEST_URI'] = $uri;
        $_GET['route'] = ltrim($uri, '/');
        
        try {
            ob_start();
            $kernel = new HttpKernel();
            $kernel->run();
            $output = ob_get_clean();
            $json = json_decode($output, true);
            
            if ($json !== null) {
                echo "  [$method] $uri -> $desc: OK (JSON)\n";
            } else {
                echo "  [$method] $uri -> $desc: NOT JSON\n";
                echo "    Response: " . substr($output, 0, 200) . "\n";
            }
        } catch (Exception $e) {
            ob_clean();
            echo "  [$method] $uri -> $desc: ERROR - " . $e->getMessage() . "\n";
        }
    }
    
    // Test admin login
    echo "\n--- Admin Login Test ---\n";
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_SERVER['REQUEST_URI'] = '/api/admin/login';
    $_GET['route'] = 'api/admin/login';
    $_SERVER['CONTENT_TYPE'] = 'application/json';
    
    // Mock php://input
    $inputData = json_encode(['username' => 'admin', 'password' => $env['ADMIN_PASSWORD'] ?? 'admin123']);
    // We need to override php://input - can't do this easily in PHP
    // Let's directly test the login controller
    
    try {
        $authService = new AuthService();
        $result = $authService->login('admin', $env['ADMIN_PASSWORD'] ?? 'admin123');
        if ($result) {
            echo "  Login: SUCCESS\n";
            echo "  Admin: " . json_encode($result) . "\n";
        } else {
            echo "  Login: FAILED (invalid credentials)\n";
        }
    } catch (Exception $e) {
        echo "  Login ERROR: " . $e->getMessage() . "\n";
    }
    
    // Test dashboard (requires auth)
    echo "\n--- Admin Dashboard Test ---\n";
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['REQUEST_URI'] = '/api/admin/dashboard';
    $_GET['route'] = 'api/admin/dashboard';
    
    try {
        ob_start();
        $kernel2 = new HttpKernel();
        $kernel2->run();
        $output = ob_get_clean();
        $json = json_decode($output, true);
        
        if ($json !== null && isset($json['error'])) {
            echo "  Dashboard: " . $json['error'] . " (expected - not authenticated via test)\n";
        } elseif ($json !== null) {
            echo "  Dashboard: OK\n";
            echo "  Stats: " . json_encode($json['stats'] ?? []) . "\n";
        } else {
            echo "  Dashboard: NOT JSON\n";
            echo "  Response: " . substr($output, 0, 200) . "\n";
        }
    } catch (Exception $e) {
        ob_clean();
        echo "  Dashboard ERROR: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "Bootstrap ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
