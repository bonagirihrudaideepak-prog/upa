<?php
class ProductModel
{
    private $db;

    public function __construct()
    {
        $this->db = (new DatabaseConnection())->getConnection();
    }

    public function getAll()
    {
        $stmt = $this->db->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch();
        if (!$product) return null;

        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $stmt->execute([$id]);
        $product['images'] = $stmt->fetchAll();

        $stmt = $this->db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
        $stmt->execute([$id]);
        $product['variants'] = $stmt->fetchAll();

        $stmt = $this->db->prepare("SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 5");
        $stmt->execute([$id]);
        $product['recent_reviews'] = $stmt->fetchAll();

        return $product;
    }

    public function getByCategory($category)
    {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC");
        $stmt->execute([$category]);
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function getFeatured()
    {
        $stmt = $this->db->query("SELECT * FROM products WHERE is_featured = TRUE ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function getNewArrivals()
    {
        $stmt = $this->db->query("SELECT * FROM products WHERE is_new_arrival = TRUE ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function getRecommended()
    {
        $stmt = $this->db->query("SELECT * FROM products ORDER BY likes_count DESC LIMIT 8");
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function search($query)
    {
        $like = '%' . $query . '%';
        $stmt = $this->db->prepare("SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY created_at DESC");
        $stmt->execute([$like, $like]);
        $products = $stmt->fetchAll();
        return $this->attachImagesAndVariants($products);
    }

    public function addReview($productId, $userName, $rating, $comment)
    {
        $stmt = $this->db->prepare("INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$productId, $userName, $rating, $comment]);
        return $this->db->lastInsertId();
    }

    public function getReviews($productId)
    {
        $stmt = $this->db->prepare("SELECT id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC");
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function likeProduct($productId)
    {
        $stmt = $this->db->prepare("UPDATE products SET likes_count = likes_count + 1 WHERE id = ?");
        $stmt->execute([$productId]);
    }

    public function getLikeCount($productId)
    {
        $stmt = $this->db->prepare("SELECT likes_count FROM products WHERE id = ?");
        $stmt->execute([$productId]);
        $row = $stmt->fetch();
        return $row ? (int)$row['likes_count'] : 0;
    }

    public function getVariants($productId)
    {
        $stmt = $this->db->prepare("SELECT * FROM product_variants WHERE product_id = ?");
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function getImages($productId)
    {
        $stmt = $this->db->prepare("SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC");
        $stmt->execute([$productId]);
        return $stmt->fetchAll();
    }

    public function create($data)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO products (name, description, sku, price, category, stock, is_featured, is_new_arrival, is_offer, is_out_of_stock)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['name'],
            $data['description'] ?? null,
            $data['sku'] ?? null,
            $data['price'],
            $data['category'],
            $data['stock'] ?? 0,
            !empty($data['is_featured']) ? 1 : 0,
            !empty($data['is_new_arrival']) ? 1 : 0,
            !empty($data['is_offer']) ? 1 : 0,
            !empty($data['is_out_of_stock']) ? 1 : 0,
        ]);
        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $fields = [];
        $values = [];
        $allowed = ['name', 'description', 'sku', 'price', 'category', 'stock', 'is_featured', 'is_new_arrival', 'is_offer', 'is_out_of_stock'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "`$field` = ?";
                $val = $data[$field];
                if (in_array($field, ['is_featured', 'is_new_arrival', 'is_offer', 'is_out_of_stock'])) {
                    $val = !empty($val) ? 1 : 0;
                }
                $values[] = $val;
            }
        }
        if (empty($fields)) return false;
        $values[] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($values);
    }

    public function delete($id)
    {
        try {
            $this->db->beginTransaction();
            $stmt = $this->db->prepare("DELETE FROM product_images WHERE product_id = ?");
            $stmt->execute([$id]);
            $stmt = $this->db->prepare("DELETE FROM product_variants WHERE product_id = ?");
            $stmt->execute([$id]);
            $stmt = $this->db->prepare("DELETE FROM reviews WHERE product_id = ?");
            $stmt->execute([$id]);
            $stmt = $this->db->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            $deleted = $stmt->rowCount() > 0;
            $this->db->commit();
            return $deleted;
        } catch (Throwable $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Product delete error: " . $e->getMessage());
            return false;
        }
    }

    public function updateStock($id, $stock)
    {
        $stmt = $this->db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        return $stmt->execute([$stock, $id]);
    }

    public function toggleFeatured($id)
    {
        $stmt = $this->db->prepare("UPDATE products SET is_featured = NOT is_featured WHERE id = ?");
        return $stmt->execute([$id]);
    }

    private function attachImagesAndVariants($products)
    {
        if (empty($products)) return [];

        $ids = array_column($products, 'id');
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        $stmt = $this->db->prepare("SELECT product_id, image_path FROM product_images WHERE product_id IN ($placeholders) AND image_type = 'main'");
        $stmt->execute($ids);
        $images = [];
        while ($row = $stmt->fetch()) {
            if (!isset($images[$row['product_id']])) {
                $images[$row['product_id']] = $row['image_path'];
            }
        }

        $stmt = $this->db->prepare("SELECT * FROM product_variants WHERE product_id IN ($placeholders)");
        $stmt->execute($ids);
        $variants = [];
        while ($row = $stmt->fetch()) {
            $variants[$row['product_id']][] = $row;
        }

        foreach ($products as &$product) {
            $pid = $product['id'];
            $product['main_image'] = $images[$pid] ?? null;
            $product['variants'] = $variants[$pid] ?? [];
            $product['likes_count'] = (int)$product['likes_count'];
        }

        return $products;
    }
}
