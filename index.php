<?php
$envPath = __DIR__ . '/backend/.env';
$setupNeeded = false;

if (!file_exists($envPath)) {
    $setupNeeded = true;
} else {
    $env = parse_ini_file($envPath);
    if (empty($env['DB_HOST']) || $env['DB_HOST'] === 'localhost' || empty($env['DB_NAME'])) {
        $setupNeeded = true;
    }
}

if ($setupNeeded) {
    header('Location: dashboard_setup.php');
    exit;
}

readfile(__DIR__ . '/frontend/dist/index.html');
