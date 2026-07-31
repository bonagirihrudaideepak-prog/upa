<?php
class ProductController
{
    private $productModel;

    public function __construct()
    {
        $this->productModel = new ProductModel();
    }

    public function getAllProducts($request, $response)
    {
        $params = $request['params'] ?? [];
        $input = $request['input'] ?? [];
        $category = $input['category'] ?? null;

        if ($category) {
            $products = $this->productModel->getByCategory($category);
        } else {
            $products = $this->productModel->getAll();
        }

        $response->setJson($products);
    }

    public function getProduct($request, $response)
    {
        $params = $request['params'] ?? [];
        $productId = $params[0] ?? null;

        if (!$productId) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $product = $this->productModel->getById($productId);
        if (!$product) {
            $response->setStatusCode(404);
            $response->setJson(['error' => 'Product not found']);
            return;
        }

        $response->setJson($product);
    }

    public function getProductsByCategory($request, $response)
    {
        $params = $request['params'] ?? [];
        $category = $params[0] ?? null;

        if (!$category) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Category is required']);
            return;
        }

        $products = $this->productModel->getByCategory($category);
        $response->setJson($products);
    }

    public function getFeatured($request, $response)
    {
        $products = $this->productModel->getFeatured();
        $response->setJson($products);
    }

    public function getNewArrivals($request, $response)
    {
        $products = $this->productModel->getNewArrivals();
        $response->setJson($products);
    }

    public function search($request, $response)
    {
        $input = $request['input'] ?? [];
        $query = $input['q'] ?? '';

        if (empty(trim($query))) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Search query is required']);
            return;
        }

        $products = $this->productModel->search($query);
        $response->setJson($products);
    }

    public function likeProduct($request, $response)
    {
        $params = $request['params'] ?? [];
        $productId = $params[0] ?? null;

        if (!$productId) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $this->productModel->likeProduct($productId);
        $count = $this->productModel->getLikeCount($productId);

        $response->setJson(['message' => 'Product liked successfully', 'likes_count' => $count]);
    }

    public function getProductReviews($request, $response)
    {
        $params = $request['params'] ?? [];
        $productId = $params[0] ?? null;

        if (!$productId) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $reviews = $this->productModel->getReviews($productId);
        $response->setJson($reviews);
    }

    public function addReview($request, $response)
    {
        $input = $request['input'] ?? [];
        $productId = $input['product_id'] ?? null;
        $userName = $input['user_name'] ?? null;
        $rating = $input['rating'] ?? null;
        $comment = $input['comment'] ?? null;

        if (!$productId || !$userName || !$rating) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'product_id, user_name, and rating are required']);
            return;
        }

        $this->productModel->addReview($productId, $userName, $rating, $comment);
        $response->setStatusCode(201);
        $response->setJson(['message' => 'Review added successfully']);
    }
}
