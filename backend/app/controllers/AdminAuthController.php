<?php
class AdminAuthController
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login($request, $response)
    {
        $input = $request['input'] ?? [];
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($username) || empty($password)) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Username and password are required']);
            return;
        }

        $result = $this->authService->login($username, $password);
        if (!$result) {
            $response->setStatusCode(401);
            $response->setJson(['error' => 'Invalid credentials']);
            return;
        }

        $response->setJson([
            'message' => 'Login successful',
            'admin' => $result,
        ]);
    }

    public function logout($request, $response)
    {
        $this->authService->logout();
        $response->setJson(['message' => 'Logged out successfully']);
    }

    public function checkSession($request, $response)
    {
        $admin = $this->authService->getCurrentAdmin();
        if (!$admin) {
            $response->setStatusCode(401);
            $response->setJson(['error' => 'Not authenticated']);
            return;
        }
        $response->setJson(['admin' => $admin]);
    }
}
