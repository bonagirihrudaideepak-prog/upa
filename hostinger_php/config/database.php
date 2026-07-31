<?php
// Hostinger MySQL Database Connection Configuration

function getDatabaseConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? 'localhost');
        $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? '3306');
        $dbname = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? 'upanishad_store');
        $username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? 'root');
        $password = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? '');

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database connection error',
                'details' => $e->getMessage()
            ]);
            exit;
        }
    }

    return $pdo;
}
