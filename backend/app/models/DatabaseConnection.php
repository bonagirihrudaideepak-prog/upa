<?php
class DatabaseConnection
{
    private static ?PDO $instance = null;

    public function getConnection(): PDO
    {
        if (self::$instance === null) {
            self::$instance = $this->connect();
        }
        return self::$instance;
    }

    private function connect(): PDO
    {
        $config = $this->loadConfig();
        
        try {
            return new PDO(
                "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset=utf8mb4",
                $config['username'],
                $config['password'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection error. Please check configuration.']);
            exit;
        }
    }

    private function loadConfig(): array
    {
        $envFile = __DIR__ . '/../../.env';
        $fileEnv = file_exists($envFile) ? parse_ini_file($envFile) : [];

        $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? $_SERVER['DB_HOST'] ?? $fileEnv['DB_HOST'] ?? 'localhost');
        $port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? $_SERVER['DB_PORT'] ?? $fileEnv['DB_PORT'] ?? '3306');
        $dbname = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? $_SERVER['DB_NAME'] ?? $fileEnv['DB_NAME'] ?? 'upanishad_store');
        $username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? $_SERVER['DB_USER'] ?? $fileEnv['DB_USER'] ?? 'root');
        $password = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? $_SERVER['DB_PASS'] ?? $fileEnv['DB_PASS'] ?? '');

        return [
            'host' => $host,
            'port' => $port,
            'dbname' => $dbname,
            'username' => $username,
            'password' => $password,
        ];
    }
}
