<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseUrl = 'http://' . $_SERVER['HTTP_HOST'];
$results = [];

function test($name, $url, $expectStatus = 200, $expectContent = null) {
    global $results;
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HEADER => true,
    ]);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($resp, 0, $headerSize);
    $body = substr($resp, $headerSize);
    $error = curl_error($ch);
    curl_close($ch);

    $pass = true;
    $issues = [];

    if ($error) { $pass = false; $issues[] = "CURL error: $error"; }
    if ($httpCode !== $expectStatus) { $pass = false; $issues[] = "Expected HTTP $expectStatus, got $httpCode"; }
    if ($expectContent && strpos($body, $expectContent) === false) {
        if ($expectContent !== 'json' || $body[0] !== '{') {
            $pass = false; $issues[] = "Missing expected content: $expectContent";
        }
    }
    if ($expectContent === 'json' && $body[0] !== '{') {
        $pass = false; $issues[] = "Expected JSON response";
    }

    $results[] = [
        'name' => $name,
        'url' => $url,
        'status' => $httpCode,
        'pass' => $pass,
        'issues' => $issues,
        'body_preview' => substr($body, 0, 200),
        'content_type' => '',
    ];
    if (preg_match('/Content-Type:\s*([^\r\n]+)/i', $headers, $m)) {
        $results[count($results)-1]['content_type'] = trim($m[1]);
    }
    return $pass;
}

// Use the server-side PHP to make requests (bypasses challenge)
function testInternal($name, $endpoint) {
    global $results;
    ob_start();
    $_SERVER['REQUEST_URI'] = $endpoint;
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_GET['route'] = ltrim($endpoint, '/');
    try {
        require __DIR__ . '/backend/index.php';
    } catch (Exception $e) {
        echo "PHP Error: " . $e->getMessage();
    }
    $body = ob_get_clean();
    $json = json_decode($body, true);
    $pass = $json !== null;
    $results[] = [
        'name' => $name,
        'url' => $endpoint,
        'status' => $pass ? 200 : 500,
        'pass' => $pass,
        'issues' => $pass ? [] : ["Response is not valid JSON"],
        'body_preview' => substr($body, 0, 200),
        'content_type' => $pass ? 'application/json' : 'text/html',
    ];
    return $pass;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Upanishad Store — Full Debug</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#333;padding:20px}
h1{font-size:22px;margin-bottom:20px}
.card{background:#fff;border-radius:8px;padding:20px;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.pass{color:#2e7d32;font-weight:600}
.fail{color:#c62828;font-weight:600}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}
th{background:#fafafa;font-weight:600}
pre{background:#263238;color:#e0e0e0;padding:12px;border-radius:4px;overflow-x:auto;font-size:12px;margin:4px 0}
.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600}
.badge-ok{background:#e8f5e9;color:#2e7d32}
.badge-fail{background:#fbe9e7;color:#c62828}
.env-box{background:#f5f5f5;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;margin:8px 0}
</style>
</head>
<body>

<h1> Upanishad Store — Full Debug</h1>

<div class="card">
<h2>1. Environment</h2>
<?php
$env = file_exists(__DIR__ . '/backend/.env') ? parse_ini_file(__DIR__ . '/backend/.env') : null;
if ($env) {
    echo '<div class="env-box">';
    foreach ($env as $k => $v) {
        $val = ($k === 'DB_PASS' || $k === 'ADMIN_PASSWORD') ? str_repeat('*', strlen($v)) : $v;
        echo htmlspecialchars("$k=$val") . "\n";
    }
    echo '</div>';
} else {
    echo '<p class="fail"> backend/.env not found!</p>';
}
?>
</div>

<div class="card">
<h2>2. Database Connection</h2>
<?php
if ($env && isset($env['DB_HOST'])) {
    try {
        $pdo = new PDO(
            "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4",
            $env['DB_USER'], $env['DB_PASS'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        echo '<p class="pass"> Connected to MySQL</p>';
        $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo '<p>Tables: ' . implode(', ', $tables) . '</p>';
        
        // Verify admin password
        $admin = $pdo->query("SELECT username, password_hash FROM admin_users WHERE username = 'admin'")->fetch();
        if ($admin) {
            $passVerify = password_verify($env['ADMIN_PASSWORD'] ?? 'admin123', $admin['password_hash']);
            echo '<p>Admin user: ' . $admin['username'] . ' — Password verify: ' . ($passVerify ? 'PASS' : 'FAIL') . '</p>';
            if (!$passVerify) {
                $newHash = password_hash($env['ADMIN_PASSWORD'] ?? 'admin123', PASSWORD_BCRYPT);
                $pdo->exec("UPDATE admin_users SET password_hash = '$newHash' WHERE username = 'admin'");
                echo '<p class="pass">Password hash updated!</p>';
            }
        } else {
            echo '<p class="fail">No admin user found!</p>';
        }
    } catch (Exception $e) {
        echo '<p class="fail">DB Error: ' . htmlspecialchars($e->getMessage()) . '</p>';
    }
}
?>
</div>

<div class="card">
<h2>3. API Endpoint Tests (Internal)</h2>
<?php
testInternal('GET /api/products', '/api/products');
testInternal('GET /api/categories', '/api/categories');
testInternal('GET /api/offers', '/api/offers');
testInternal('GET /api/products/featured', '/api/products/featured');

// POST /api/admin/login (test with curl internally)
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$input = json_encode(['username' => 'admin', 'password' => ($env['ADMIN_PASSWORD'] ?? 'admin123')]);
$tmpFile = tmpfile();
fwrite($tmpFile, $input);
fseek($tmpFile, 0);
// We'll use curl for this instead
ob_clean();
?>
<table>
<thead><tr><th>Test</th><th>Status</th><th>Issues</th><th>Preview</th></tr></thead>
<tbody>
<?php foreach ($results as $r): ?>
<tr>
<td><strong><?= htmlspecialchars($r['name']) ?></strong><br><small><?= htmlspecialchars($r['url']) ?></small></td>
<td><span class="badge badge-<?= $r['pass'] ? 'ok' : 'fail' ?>"><?= $r['status'] ?></span></td>
<td><?= $r['pass'] ? '<span class="pass">OK</span>' : '<span class="fail">' . htmlspecialchars(implode('; ', $r['issues'])) . '</span>' ?></td>
<td><pre><?= htmlspecialchars($r['body_preview']) ?></pre></td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
</div>

<div class="card">
<h2>4. CURL-Based External API Tests</h2>
<?php
$results2 = [];
$tests2 = [
    'Root page' => ['url' => $baseUrl . '/', 'expect' => 'root'],
    'Dashboard setup' => ['url' => $baseUrl . '/dashboard_setup.php?step=check', 'expect' => 'Upanishad'],
    'CSS asset' => ['url' => $baseUrl . '/assets/index-ba58bb2f.css', 'expect' => 'body'],
    'JS asset' => ['url' => $baseUrl . '/assets/index-053ffaca.js', 'expect' => 'createElement'],
    'Old CSS (cleanup check)' => ['url' => $baseUrl . '/assets/index-82703b6e.css', 'expect_404' => true],
];
foreach ($tests2 as $name => $t) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $t['url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HEADER => true,
        CURLOPT_USERAGENT => 'Mozilla/5.0',
    ]);
    $resp = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($resp, 0, $headerSize);
    $body = substr($resp, $headerSize);
    curl_close($ch);

    $pass = true;
    $issues = [];
    if (!empty($t['expect_404'])) {
        if ($httpCode !== 404) { $pass = false; $issues[] = "Expected 404, got $httpCode"; }
    } else {
        if ($httpCode !== 200) { $pass = false; $issues[] = "Expected 200, got $httpCode"; }
        if (!empty($t['expect']) && strpos($body, $t['expect']) === false) {
            $pass = false; $issues[] = "Missing content: {$t['expect']}";
        }
    }
    if (!empty($t['mime'])) {
        if (preg_match('/Content-Type:\s*([^\r\n]+)/i', $headers, $m)) {
            $ct = trim($m[1]);
            if (strpos($ct, $t['mime']) === false) $issues[] = "MIME: $ct";
        }
    }
    $results2[] = ['name' => $name, 'url' => $t['url'], 'status' => $httpCode, 'pass' => $pass, 'issues' => $issues, 'body_preview' => substr($body, 0, 150)];
}
?>
<table>
<thead><tr><th>Test</th><th>Status</th><th>Issues</th><th>Preview</th></tr></thead>
<tbody>
<?php foreach ($results2 as $r): ?>
<tr>
<td><strong><?= htmlspecialchars($r['name']) ?></strong><br><small><?= htmlspecialchars($r['url']) ?></small></td>
<td><span class="badge badge-<?= $r['pass'] ? 'ok' : 'fail' ?>"><?= $r['status'] ?></span></td>
<td><?= $r['pass'] ? '<span class="pass">OK</span>' : '<span class="fail">' . htmlspecialchars(implode('; ', $r['issues'])) . '</span>' ?></td>
<td><pre><?= htmlspecialchars($r['body_preview']) ?></pre></td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
</div>

<div class="card">
<h2>5. Files Check</h2>
<?php
$files = [
    '/.htaccess',
    '/index.php',
    '/backend/index.php',
    '/frontend/dist/index.html',
    '/backend/.env',
    '/dashboard_setup.php',
];
foreach ($files as $f) {
    $path = __DIR__ . $f;
    $exists = file_exists($path);
    echo '<p>' . ($exists ? '✓' : '✗') . " $f" . ($exists ? ' (' . round(filesize($path)/1024, 1) . ' KB)' : '') . '</p>';
}
?>
</div>

</body>
</html>
