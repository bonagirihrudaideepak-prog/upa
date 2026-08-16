<?php
/**
 * Database credentials — EXAMPLE TEMPLATE (no real secrets).
 *
 * Copy to config/credentials.php on the server (or let the CI deploy pipeline
 * generate it from GitHub Secrets). Never commit real credentials.
 *
 * Priority used by config/database.php:
 *   1. Environment variables (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)
 *   2. This file (config/credentials.php)
 *   3. Fail closed (generic 500) if neither is available.
 *
 * Bootstrap admin (used only when the admin_users table is empty):
 *   ADMIN_USERNAME / ADMIN_PASSWORD environment variables or $admin['username']/$admin['password'] below.
 */
return [
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => getenv('DB_PORT') ?: '3306',
    'name'     => getenv('DB_NAME') ?: 'your_database_name',
    'user'     => getenv('DB_USER') ?: 'your_database_user',
    'password' => getenv('DB_PASS') ?: 'your_database_password',
    // JWT signing secret (production requirement). Generate with: php -r "echo bin2hex(random_bytes(32));"
    'jwt_secret' => getenv('JWT_SECRET') ?: '',
    'admin'    => [
        'username' => getenv('ADMIN_USERNAME') ?: 'admin',
        'password' => getenv('ADMIN_PASSWORD') ?: '',
    ],
];