<?php
define('APP_NAME', 'Upanishad Store API');
define('BASE_PATH', __DIR__);

spl_autoload_register(function ($class) {
    $dirs = ['app/models', 'app/controllers', 'app/services', 'app/middleware'];
    foreach ($dirs as $dir) {
        $file = BASE_PATH . '/' . $dir . '/' . $class . '.php';
        if (file_exists($file)) { require $file; return; }
    }
});

require BASE_PATH . '/app/HttpKernel.php';
require BASE_PATH . '/app/Response.php';

$kernel = new HttpKernel();
$kernel->run();
