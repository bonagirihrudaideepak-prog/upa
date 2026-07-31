<?php
// Router for PHP built-in development server
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Route API requests to api/index.php
if (preg_match('#^/api/#', $path)) {
    require __DIR__ . '/api/index.php';
    return true;
}

// Serve static files from frontend/dist if they exist
$staticFile = __DIR__ . '/frontend/dist' . $path;
if (file_exists($staticFile) && !is_dir($staticFile)) {
    return false; // Let PHP serve it
}

// For Vite dev, proxy to Vite dev server on port 5173
// The Vite dev server handles all non-API routes
// For production build, serve index.html
$distIndex = __DIR__ . '/frontend/dist/index.html';
if (file_exists($distIndex)) {
    readfile($distIndex);
    return true;
}

return false;
