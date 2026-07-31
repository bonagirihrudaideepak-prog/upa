<?php
// ===== Public API Routes =====

// Products
$app->get('/api/products/featured', function ($request, $response) {
    (new ProductController())->getFeatured($request, $response);
});

$app->get('/api/products/new-arrivals', function ($request, $response) {
    (new ProductController())->getNewArrivals($request, $response);
});

$app->get('/api/products/search', function ($request, $response) {
    (new ProductController())->search($request, $response);
});

$app->get('/api/products/category/{category}', function ($request, $response) {
    (new ProductController())->getProductsByCategory($request, $response);
});

$app->get('/api/products', function ($request, $response) {
    (new ProductController())->getAllProducts($request, $response);
});

$app->get('/api/products/{id}', function ($request, $response) {
    (new ProductController())->getProduct($request, $response);
});

$app->post('/api/products/{id}/like', function ($request, $response) {
    (new ProductController())->likeProduct($request, $response);
});

$app->get('/api/products/{id}/reviews', function ($request, $response) {
    (new ProductController())->getProductReviews($request, $response);
});

// Reviews
$app->post('/api/reviews', function ($request, $response) {
    (new ProductController())->addReview($request, $response);
});

// Categories
$app->get('/api/categories', function ($request, $response) {
    (new CategoryController())->getAll($request, $response);
});

// Offers
$app->get('/api/offers', function ($request, $response) {
    (new OfferController())->getAll($request, $response);
});

// ===== Admin Auth Routes (no middleware) =====
$app->post('/api/admin/login', function ($request, $response) {
    (new AdminAuthController())->login($request, $response);
});

$app->post('/api/admin/logout', function ($request, $response) {
    (new AdminAuthController())->logout($request, $response);
});

$app->get('/api/admin/me', function ($request, $response) {
    (new AdminAuthController())->checkSession($request, $response);
});

// ===== Admin Protected Routes (with auth middleware) =====

function adminRoute($app, $method, $path, $callback)
{
    $app->$method($path, function ($request, $response) use ($callback) {
        $middleware = new AdminAuthMiddleware();
        $middleware->handle($request, $response, $callback);
    });
}

adminRoute($app, 'get', '/api/admin/dashboard', function ($request, $response) {
    (new AdminController())->getDashboard($request, $response);
});

adminRoute($app, 'get', '/api/admin/products', function ($request, $response) {
    (new AdminProductController())->getAll($request, $response);
});

adminRoute($app, 'post', '/api/admin/products', function ($request, $response) {
    (new AdminProductController())->create($request, $response);
});

adminRoute($app, 'get', '/api/admin/products/{id}', function ($request, $response) {
    (new AdminProductController())->getById($request, $response);
});

adminRoute($app, 'put', '/api/admin/products/{id}', function ($request, $response) {
    (new AdminProductController())->update($request, $response);
});

adminRoute($app, 'delete', '/api/admin/products/{id}', function ($request, $response) {
    (new AdminProductController())->delete($request, $response);
});

adminRoute($app, 'post', '/api/admin/products/{id}/toggle-featured', function ($request, $response) {
    (new AdminProductController())->toggleFeatured($request, $response);
});

adminRoute($app, 'get', '/api/admin/offers', function ($request, $response) {
    (new OfferController())->getAdminAll($request, $response);
});

adminRoute($app, 'post', '/api/admin/offers', function ($request, $response) {
    (new OfferController())->create($request, $response);
});

adminRoute($app, 'put', '/api/admin/offers/{id}', function ($request, $response) {
    (new OfferController())->update($request, $response);
});

adminRoute($app, 'delete', '/api/admin/offers/{id}', function ($request, $response) {
    (new OfferController())->delete($request, $response);
});

adminRoute($app, 'post', '/api/admin/upload', function ($request, $response) {
    try {
        $uploadService = new FileUploadService();
        if (empty($_FILES['file'])) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'No file uploaded']);
            return;
        }
        $path = $uploadService->upload($_FILES['file'], 'prod_');
        $response->setJson(['path' => $path, 'url' => $path]);
    } catch (Exception $e) {
        $response->setStatusCode(400);
        $response->setJson(['error' => $e->getMessage()]);
    }
});

adminRoute($app, 'delete', '/api/admin/upload', function ($request, $response) {
    $input = $request['input'] ?? [];
    $path = $input['path'] ?? '';
    if (empty($path)) {
        $response->setStatusCode(400);
        $response->setJson(['error' => 'File path is required']);
        return;
    }
    $uploadService = new FileUploadService();
    $uploadService->delete($path);
    $response->setJson(['message' => 'File deleted']);
});
