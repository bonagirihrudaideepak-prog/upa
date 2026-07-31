<?php
class AdminProductController
{
    private $productModel;
    private $db;

    public function __construct()
    {
        $this->productModel = new ProductModel();
        $this->db = (new DatabaseConnection())->getConnection();
    }

    public function getAll($request, $response)
    {
        $products = $this->productModel->getAll();
        $response->setJson($products);
    }

    public function getById($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;

        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $product = $this->productModel->getById($id);
        if (!$product) {
            $response->setStatusCode(404);
            $response->setJson(['error' => 'Product not found']);
            return;
        }

        $response->setJson($product);
    }

    public function create($request, $response)
    {
        $data = $request['input'] ?? [];

        if (empty($data['name']) || empty($data['price']) || empty($data['category'])) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'name, price, and category are required']);
            return;
        }

        try {
            $this->db->beginTransaction();

            $productId = $this->productModel->create($data);

            if (!empty($data['variants']) && is_array($data['variants'])) {
                $stmt = $this->db->prepare("INSERT INTO product_variants (product_id, color, color_code, model, stock) VALUES (?, ?, ?, ?, ?)");
                foreach ($data['variants'] as $variant) {
                    $stmt->execute([$productId, $variant['color'], $variant['color_code'] ?? '#000000', $variant['model'] ?? null, $variant['stock'] ?? 0]);
                }
            }

            if (!empty($data['images']) && is_array($data['images'])) {
                $stmt = $this->db->prepare("INSERT INTO product_images (product_id, image_path, image_type, is_original_1_1, is_original_3_4, display_order) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($data['images'] as $i => $img) {
                    $stmt->execute([
                        $productId,
                        $img['image_path'],
                        $img['image_type'] ?? 'alt',
                        !empty($img['is_original_1_1']) ? 1 : 0,
                        !empty($img['is_original_3_4']) ? 1 : 0,
                        $img['display_order'] ?? $i,
                    ]);
                }
            }

            $this->db->commit();
            $product = $this->productModel->getById($productId);
            $response->setStatusCode(201);
            $response->setJson($product);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Create product error: " . $e->getMessage());
            $response->setStatusCode(500);
            $response->setJson(['error' => 'Failed to create product']);
        }
    }

    public function update($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;
        $data = $request['input'] ?? [];

        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $existing = $this->productModel->getById($id);
        if (!$existing) {
            $response->setStatusCode(404);
            $response->setJson(['error' => 'Product not found']);
            return;
        }

        try {
            $this->db->beginTransaction();

            $this->productModel->update($id, $data);

            if (isset($data['variants']) && is_array($data['variants'])) {
                $stmt = $this->db->prepare("DELETE FROM product_variants WHERE product_id = ?");
                $stmt->execute([$id]);
                $stmt = $this->db->prepare("INSERT INTO product_variants (product_id, color, color_code, model, stock) VALUES (?, ?, ?, ?, ?)");
                foreach ($data['variants'] as $variant) {
                    $stmt->execute([$id, $variant['color'], $variant['color_code'] ?? '#000000', $variant['model'] ?? null, $variant['stock'] ?? 0]);
                }
            }

            if (isset($data['images']) && is_array($data['images'])) {
                $stmt = $this->db->prepare("DELETE FROM product_images WHERE product_id = ?");
                $stmt->execute([$id]);
                $stmt = $this->db->prepare("INSERT INTO product_images (product_id, image_path, image_type, is_original_1_1, is_original_3_4, display_order) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($data['images'] as $i => $img) {
                    $stmt->execute([
                        $id,
                        $img['image_path'],
                        $img['image_type'] ?? 'alt',
                        !empty($img['is_original_1_1']) ? 1 : 0,
                        !empty($img['is_original_3_4']) ? 1 : 0,
                        $img['display_order'] ?? $i,
                    ]);
                }
            }

            $this->db->commit();
            $product = $this->productModel->getById($id);
            $response->setJson($product);
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Update product error: " . $e->getMessage());
            $response->setStatusCode(500);
            $response->setJson(['error' => 'Failed to update product']);
        }
    }

    public function delete($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;

        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $deleted = $this->productModel->delete($id);
        if (!$deleted) {
            $response->setStatusCode(404);
            $response->setJson(['error' => 'Product not found']);
            return;
        }

        $response->setJson(['message' => 'Product deleted successfully']);
    }

    public function updateStock($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;
        $data = $request['input'] ?? [];
        $stock = $data['stock'] ?? null;

        if (!$id || $stock === null) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID and stock are required']);
            return;
        }

        $this->productModel->updateStock($id, (int)$stock);
        $response->setJson(['message' => 'Stock updated successfully']);
    }

    public function toggleFeatured($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;

        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Product ID is required']);
            return;
        }

        $this->productModel->toggleFeatured($id);
        $product = $this->productModel->getById($id);
        $response->setJson(['message' => 'Featured status toggled', 'is_featured' => $product['is_featured'] ?? false]);
    }
}
