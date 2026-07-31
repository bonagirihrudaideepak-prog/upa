<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config/database.php';

$pdo = getDatabaseConnection();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get input JSON
function getJsonInput() {
    $raw = file_get_contents('php_input');
    if (empty($raw)) {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? array_merge($_POST, $decoded) : $_POST;
}

// Format product for JSON output
function formatProductRow($p, $pdo) {
    if (!$p) return null;
    $id = (int)$p['id'];

    // Images
    $stmt = $pdo->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
    $stmt->execute([$id]);
    $images = $stmt->fetchAll();

    // Variants
    $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ?");
    $stmt->execute([$id]);
    $variants = $stmt->fetchAll();

    // Main Image
    $mainImage = null;
    foreach ($images as $img) {
        if ($img['image_type'] === 'main') {
            $mainImage = $img['image_path'];
            break;
        }
    }
    if (!$mainImage && !empty($images)) {
        $mainImage = $images[0]['image_path'];
    }

    return [
        'id' => $id,
        'name' => $p['name'],
        'description' => $p['description'],
        'sku' => $p['sku'],
        'price' => (float)$p['price'],
        'category' => $p['category'],
        'stock' => (int)($p['stock'] ?? 0),
        'is_featured' => (bool)$p['is_featured'],
        'is_new_arrival' => (bool)$p['is_new_arrival'],
        'is_offer' => (bool)$p['is_offer'],
        'is_out_of_stock' => (bool)$p['is_out_of_stock'],
        'likes_count' => (int)($p['likes_count'] ?? 0),
        'created_at' => $p['created_at'],
        'main_image' => $mainImage,
        'images' => array_map(function($img) {
            return [
                'id' => (int)$img['id'],
                'product_id' => (int)$img['product_id'],
                'image_path' => $img['image_path'],
                'image_type' => $img['image_type'],
                'is_original_1_1' => (bool)$img['is_original_1_1'],
                'is_original_3_4' => (bool)$img['is_original_3_4'],
                'display_order' => (int)$img['display_order']
            ];
        }, $images),
        'variants' => array_map(function($v) {
            return [
                'id' => (int)$v['id'],
                'product_id' => (int)$v['product_id'],
                'color' => $v['color'],
                'color_code' => $v['color_code'],
                'model' => $v['model'],
                'stock' => (int)$v['stock']
            ];
        }, $variants)
    ];
}

// API ROUTING

// 1. GET /api/categories
if (preg_match('#^/api/categories$#i', $uri) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC");
    $rows = $stmt->fetchAll();
    echo json_encode(array_map(function($c) {
        return [
            'id' => (int)$c['id'],
            'name' => $c['name'],
            'slug' => $c['slug'],
            'description' => $c['description'],
            'is_active' => (bool)$c['is_active'],
            'display_order' => (int)$c['display_order']
        ];
    }, $rows));
    exit;
}

// 2. GET /api/products/featured
if (preg_match('#^/api/products/featured$#i', $uri) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products WHERE is_featured = TRUE ORDER BY created_at DESC");
    $products = $stmt->fetchAll();
    echo json_encode(array_map(function($p) use ($pdo) { return formatProductRow($p, $pdo); }, $products));
    exit;
}

// 3. GET /api/products/new-arrivals
if (preg_match('#^/api/products/new-arrivals$#i', $uri) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM products WHERE is_new_arrival = TRUE ORDER BY created_at DESC");
    $products = $stmt->fetchAll();
    echo json_encode(array_map(function($p) use ($pdo) { return formatProductRow($p, $pdo); }, $products));
    exit;
}

// 4. GET /api/products/search
if (preg_match('#^/api/products/search$#i', $uri) && $method === 'GET') {
    $q = trim($_GET['q'] ?? '');
    if (empty($q)) {
        http_response_code(400);
        echo json_encode(['error' => 'Search query is required']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC");
    $like = '%' . $q . '%';
    $stmt->execute([$like, $like]);
    $products = $stmt->fetchAll();
    echo json_encode(array_map(function($p) use ($pdo) { return formatProductRow($p, $pdo); }, $products));
    exit;
}

// 5. GET /api/products/category/{category}
if (preg_match('#^/api/products/category/([^/]+)$#i', $uri, $matches) && $method === 'GET') {
    $catParam = urldecode($matches[1]);
    $stmt = $pdo->prepare("SELECT name FROM categories WHERE slug = ? OR name = ?");
    $stmt->execute([$catParam, $catParam]);
    $catObj = $stmt->fetch();
    $catName = $catObj ? $catObj['name'] : $catParam;

    $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC");
    $stmt->execute([$catName]);
    $products = $stmt->fetchAll();
    echo json_encode(array_map(function($p) use ($pdo) { return formatProductRow($p, $pdo); }, $products));
    exit;
}

// 6. GET /api/products
if (preg_match('#^/api/products$#i', $uri) && $method === 'GET') {
    $category = $_GET['category'] ?? null;
    if ($category) {
        $stmt = $pdo->prepare("SELECT name FROM categories WHERE slug = ? OR name = ?");
        $stmt->execute([$category, $category]);
        $catObj = $stmt->fetch();
        $catName = $catObj ? $catObj['name'] : $category;

        $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC");
        $stmt->execute([$catName]);
    } else {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
    }
    $products = $stmt->fetchAll();
    echo json_encode(array_map(function($p) use ($pdo) { return formatProductRow($p, $pdo); }, $products));
    exit;
}

// 7. GET /api/products/{id}
if (preg_match('#^/api/products/(\d+)$#i', $uri, $matches) && $method === 'GET') {
    $id = (int)$matches[1];
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    $formatted = formatProductRow($product, $pdo);

    // Attach recent reviews
    $stmt = $pdo->prepare("SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt->execute([$id]);
    $formatted['recent_reviews'] = array_map(function($r) {
        return [
            'id' => (int)$r['id'],
            'user_name' => $r['user_name'],
            'rating' => (int)$r['rating'],
            'comment' => $r['comment'],
            'created_at' => $r['created_at']
        ];
    }, $stmt->fetchAll());

    echo json_encode($formatted);
    exit;
}

// 8. POST /api/products/{id}/like
if (preg_match('#^/api/products/(\d+)/like$#i', $uri, $matches) && $method === 'POST') {
    $id = (int)$matches[1];
    $stmt = $pdo->prepare("UPDATE products SET likes_count = likes_count + 1 WHERE id = ?");
    $stmt->execute([$id]);

    $stmt = $pdo->prepare("SELECT likes_count FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    echo json_encode(['message' => 'Product liked successfully', 'likes_count' => (int)($row['likes_count'] ?? 0)]);
    exit;
}

// 9. GET /api/offers
if (preg_match('#^/api/offers$#i', $uri) && $method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM offers WHERE is_active = TRUE ORDER BY created_at DESC");
    $offers = $stmt->fetchAll();
    echo json_encode(array_map(function($o) {
        return [
            'id' => (int)$o['id'],
            'title' => $o['title'],
            'description' => $o['description'],
            'image_path' => $o['image_path'],
            'link' => $o['link'],
            'is_active' => (bool)$o['is_active'],
            'created_at' => $o['created_at']
        ];
    }, $offers));
    exit;
}

// 10. POST /api/reviews
if (preg_match('#^/api/reviews$#i', $uri) && $method === 'POST') {
    $input = getJsonInput();
    $productId = (int)($input['product_id'] ?? 0);
    $userName = trim($input['user_name'] ?? '');
    $rating = (int)($input['rating'] ?? 0);
    $comment = trim($input['comment'] ?? '');

    if (!$productId || !$userName || !$rating) {
        http_response_code(400);
        echo json_encode(['error' => 'product_id, user_name, and rating are required']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)");
    $stmt->execute([$productId, $userName, $rating, $comment]);

    http_response_code(201);
    echo json_encode(['message' => 'Review added successfully']);
    exit;
}

// 11. POST /api/admin/login
if (preg_match('#^/api/admin/login$#i', $uri) && $method === 'POST') {
    $input = getJsonInput();
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Username and password are required']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $token = 'hostinger_session_' . base64_encode(random_bytes(32));
        $adminData = ['id' => (int)$admin['id'], 'username' => $admin['username']];
        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'admin' => $adminData,
            'user' => $adminData
        ]);
        exit;
    }

    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

// 12. GET /api/admin/dashboard
if (preg_match('#^/api/admin/dashboard$#i', $uri) && $method === 'GET') {
    $totalProducts = (int)$pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $totalCategories = (int)$pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn();
    $totalReviews = (int)$pdo->query("SELECT COUNT(*) FROM reviews")->fetchColumn();
    $totalOffers = (int)$pdo->query("SELECT COUNT(*) FROM offers")->fetchColumn();
    $totalLikes = (int)$pdo->query("SELECT SUM(likes_count) FROM products")->fetchColumn();
    $totalInventory = (int)$pdo->query("SELECT SUM(stock) FROM products")->fetchColumn();
    $featuredCount = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE is_featured = TRUE")->fetchColumn();
    $newArrivals = (int)$pdo->query("SELECT COUNT(*) FROM products WHERE is_new_arrival = TRUE")->fetchColumn();

    $recentProducts = $pdo->query("SELECT id, name, price, stock, created_at FROM products ORDER BY created_at DESC LIMIT 5")->fetchAll();
    $topProducts = $pdo->query("SELECT id, name, likes_count FROM products ORDER BY likes_count DESC LIMIT 5")->fetchAll();

    echo json_encode([
        'stats' => [
            'total_products' => $totalProducts,
            'total_categories' => $totalCategories,
            'total_reviews' => $totalReviews,
            'total_offers' => $totalOffers,
            'total_likes' => $totalLikes,
            'total_inventory' => $totalInventory,
            'featured_count' => $featuredCount,
            'new_arrivals' => $newArrivals,
        ],
        'recent_products' => array_map(function($p) {
            return [
                'id' => (int)$p['id'],
                'name' => $p['name'],
                'price' => (float)$p['price'],
                'stock' => (int)$p['stock'],
                'created_at' => $p['created_at']
            ];
        }, $recentProducts),
        'top_liked_products' => array_map(function($p) {
            return [
                'id' => (int)$p['id'],
                'name' => $p['name'],
                'likes_count' => (int)$p['likes_count']
            ];
        }, $topProducts),
    ]);
    exit;
}

// Default 404 for unknown API route
http_response_code(404);
echo json_encode(['error' => 'API route not found']);
