<?php
class AuthService
{
    private $db;

    public function __construct()
    {
        $this->db = (new DatabaseConnection())->getConnection();
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public function login($username, $password)
    {
        $stmt = $this->db->prepare("SELECT id, username, password_hash FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            $_SESSION['admin_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            return [
                'id' => $admin['id'],
                'username' => $admin['username'],
            ];
        }

        return false;
    }

    public function logout()
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
        }
        session_destroy();
    }

    public function isAuthenticated()
    {
        return isset($_SESSION['admin_id']);
    }

    public function getCurrentAdmin()
    {
        if (!$this->isAuthenticated()) return null;
        return [
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username'],
        ];
    }
}
