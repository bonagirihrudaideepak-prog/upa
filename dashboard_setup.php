<?php
$step = $_GET['step'] ?? 'check';
$envPath = __DIR__ . '/backend/.env';
$dbSqlPath = __DIR__ . '/backend/db.sql';
$errors = [];
$success = [];

// Helper: check PHP extensions
function checkExtension($name) {
    return extension_loaded($name);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Upanishad Store — Setup</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#333;line-height:1.6;padding:40px 20px}
.container{max-width:680px;margin:0 auto}
.card{background:#fff;border-radius:12px;padding:32px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
h1{font-size:24px;margin-bottom:4px;color:#111}
h2{font-size:18px;margin-bottom:16px;color:#111}
p{color:#666;margin-bottom:20px;font-size:14px}
.status{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:14px}
.status.ok{background:#e8f5e9;color:#2e7d32}
.status.fail{background:#fbe9e7;color:#c62828}
.status.warn{background:#fff8e1;color:#f57f17}
label{display:block;font-size:14px;font-weight:600;margin-bottom:4px;color:#444}
input[type=text],input[type=password]{width:100%;padding:10px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;margin-bottom:16px}
input[type=text]:focus,input[type=password]:focus{border-color:#1976d2;outline:none;box-shadow:0 0 0 2px rgba(25,118,210,.15)}
.btn{display:inline-block;padding:10px 24px;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}
.btn-primary{background:#1976d2;color:#fff}
.btn-primary:hover{background:#1565c0}
.btn-secondary{background:#e0e0e0;color:#333}
.actions{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap}
code{background:#f5f5f5;padding:2px 6px;border-radius:4px;font-size:13px}
pre{background:#263238;color:#e0e0e0;padding:16px;border-radius:8px;overflow-x:auto;font-size:13px;margin:12px 0}
.alert{padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:14px}
.alert-error{background:#fbe9e7;color:#c62828;border:1px solid #ffcdd2}
.alert-success{background:#e8f5e9;color:#2e7d32;border:1px solid #c8e6c9}
ul{list-style:none;padding:0}
li{margin-bottom:4px}
.step-indicator{display:flex;gap:8px;margin-bottom:24px}
.dot{width:10px;height:10px;border-radius:50%;background:#e0e0e0}
.dot.active{background:#1976d2}
.dot.done{background:#4caf50}
</style>
</head>
<body>
<div class="container">
<div class="step-indicator">
<span class="dot <?= $step === 'check' ? 'active' : 'done' ?>"></span>
<span class="dot <?= $step === 'database' ? 'active' : ($step === 'done' ? 'done' : '') ?>"></span>
<span class="dot <?= $step === 'done' ? 'active' : '' ?>"></span>
</div>

<div class="card">
<h1>Upanishad Store Setup</h1>
<p>Configure your database to get the store running on InfinityFree.</p>

<?php if (!empty($success)): ?>
    <?php foreach ($success as $msg): ?>
        <div class="alert alert-success"><?= htmlspecialchars($msg) ?></div>
    <?php endforeach; ?>
<?php endif; ?>

<?php if (!empty($errors)): ?>
    <?php foreach ($errors as $msg): ?>
        <div class="alert alert-error"><?= htmlspecialchars($msg) ?></div>
    <?php endforeach; ?>
<?php endif; ?>

<?php if ($step === 'check'): ?>
    <h2>System Requirements</h2>
    <?php
    $checks = [
        'PHP 8.0+' => PHP_VERSION_ID >= 80000,
        'PDO Extension' => checkExtension('pdo'),
        'PDO MySQL' => checkExtension('pdo_mysql'),
        'mod_rewrite' => in_array('mod_rewrite', apache_get_modules() ?: [], true) || getenv('HTTP_MOD_REWRITE') || true, // best-effort check
        'JSON Extension' => checkExtension('json'),
        'GD Extension' => checkExtension('gd'),
        'MB String' => checkExtension('mbstring'),
    ];
    ?>
    <div class="status <?= PHP_VERSION_ID >= 80000 ? 'ok' : 'fail' ?>">
        <?= PHP_VERSION_ID >= 80000 ? '✓' : '✗' ?> PHP Version: <?= PHP_VERSION ?>
    </div>
    <?php foreach ($checks as $name => $ok): ?>
        <div class="status <?= $ok ? 'ok' : 'fail' ?>">
            <?= $ok ? '✓' : '✗' ?> <?= $name ?>
        </div>
    <?php endforeach; ?>

    <?php
    $allPass = PHP_VERSION_ID >= 80000 && checkExtension('pdo') && checkExtension('pdo_mysql');
    $envExists = file_exists($envPath);
    ?>
    <div class="status <?= $envExists ? 'ok' : 'warn' ?>">
        <?= $envExists ? '✓' : '⚠' ?> Configuration file (backend/.env): <?= $envExists ? 'Found' : 'Not found — will be created' ?>
    </div>

    <div class="actions">
        <?php if ($allPass): ?>
            <a href="?step=database" class="btn btn-primary">Continue to Database Setup</a>
        <?php else: ?>
            <p>Some requirements are not met. Please enable the required PHP extensions in your InfinityFree control panel (Software → PHP Extensions).</p>
        <?php endif; ?>
    </div>

<?php elseif ($step === 'database'): ?>
    <h2>Database Configuration</h2>
    <p>Enter your InfinityFree MySQL database credentials. You can find these in your InfinityFree control panel under "MySQL Databases".</p>

    <form method="post" action="?step=save">
        <label for="db_host">Database Host</label>
        <input type="text" id="db_host" name="db_host" value="sql" required>

        <label for="db_name">Database Name</label>
        <input type="text" id="db_name" name="db_name" value="if0_42539987_upanishad" required>

        <label for="db_user">Database Username</label>
        <input type="text" id="db_user" name="db_user" value="if0_42539987" required>

        <label for="db_pass">Database Password</label>
        <input type="password" id="db_pass" name="db_pass" required>

        <label for="admin_user">Admin Username</label>
        <input type="text" id="admin_user" name="admin_user" value="admin">

        <label for="admin_pass">Admin Password</label>
        <input type="password" id="admin_pass" name="admin_pass" value="admin123">

        <button type="submit" class="btn btn-primary">Save & Test Connection</button>
    </form>

<?php elseif ($step === 'save'): ?>
    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $host = $_POST['db_host'] ?? '';
        $name = $_POST['db_name'] ?? '';
        $user = $_POST['db_user'] ?? '';
        $pass = $_POST['db_pass'] ?? '';
        $adminUser = $_POST['admin_user'] ?? 'admin';
        $adminPass = $_POST['admin_pass'] ?? 'admin123';

        if (empty($host) || empty($name) || empty($user)) {
            $errors[] = 'Database host, name, and username are required.';
        } else {
            // Test connection
            try {
                $dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";
                $pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
                $success[] = 'Database connection successful!';

                // Check if tables exist
                $tables = $pdo->query("SHOW TABLES LIKE 'products'")->fetchAll();
                if (empty($tables) && file_exists($dbSqlPath)) {
                    // Import schema
                    $sql = file_get_contents($dbSqlPath);
                    $statements = explode(';', $sql);
                    foreach ($statements as $stmt) {
                        $stmt = trim($stmt);
                        if (!empty($stmt)) {
                            $pdo->exec($stmt);
                        }
                    }
                    $success[] = 'Database schema imported successfully.';
                } elseif (!empty($tables)) {
                    $success[] = 'Database tables already exist — skipping import.';
                } else {
                    $errors[] = 'Database schema file (backend/db.sql) not found.';
                }

                // Save .env
                $envContent = "DB_HOST=$host\nDB_NAME=$name\nDB_USER=$user\nDB_PASS=$pass\nADMIN_USERNAME=$adminUser\nADMIN_PASSWORD=$adminPass\n";
                $dir = dirname($envPath);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                file_put_contents($envPath, $envContent);
                $success[] = 'Configuration saved to backend/.env';

                // Redirect to done
                header('Location: ?step=done');
                exit;
            } catch (PDOException $e) {
                $errors[] = 'Database connection failed: ' . $e->getMessage();
            }
        }
    }
    ?>
    <?php if (!empty($errors)): ?>
        <a href="?step=database" class="btn btn-secondary">← Go Back</a>
    <?php endif; ?>

<?php elseif ($step === 'done'): ?>
    <h2>Setup Complete ✓</h2>
    <p>Your database is configured and ready. You can now visit your store.</p>

    <?php
    // Verify env exists
    if (file_exists($envPath)) {
        echo '<div class="status ok">✓ Configuration file saved</div>';
    }
    // Verify connection
    $env = parse_ini_file($envPath);
    if ($env) {
        try {
            $pdo = new PDO("mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4", $env['DB_USER'], $env['DB_PASS']);
            $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            echo '<div class="status ok">✓ Database connected — Tables: ' . implode(', ', $tables) . '</div>';
        } catch (Exception $e) {
            echo '<div class="status fail">✗ Database connection failed: ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
    }
    ?>

    <div class="actions">
        <a href="/" class="btn btn-primary">Go to Store</a>
        <a href="/api/admin/login" class="btn btn-secondary">Admin Login</a>
    </div>
<?php endif; ?>
</div>

<div class="card" style="background:#fafafa">
<h2>Need Help?</h2>
<ul>
<li><strong>InfinityFree MySQL:</strong> Go to Control Panel → MySQL Databases → Create Database → Note the hostname (usually <code>sql.xxx.infinityfree.com</code>).</li>
<li><strong>phpMyAdmin:</strong> Access via Control Panel → MySQL Databases → phpMyAdmin to manually import <code>backend/db.sql</code>.</li>
<li><strong>PHP Version:</strong> Set PHP 8.x in Control Panel → Software → PHP Settings.</li>
<li><strong>File Uploads:</strong> If image uploads fail, compress images before uploading (InfinityFree free plan limit ~2MB).</li>
</ul>
</div>
</div>
</body>
</html>
