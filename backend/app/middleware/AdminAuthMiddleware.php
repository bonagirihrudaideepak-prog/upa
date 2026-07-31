<?php
class AdminAuthMiddleware
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function handle($request, $response, $next)
    {
        if (!$this->authService->isAuthenticated()) {
            $response->setStatusCode(401);
            $response->setJson(['error' => 'Unauthorized: Admin login required']);
            return;
        }

        $request['admin'] = $this->authService->getCurrentAdmin();
        $next($request, $response);
    }
}
