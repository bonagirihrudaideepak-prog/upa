<?php
class AdminController
{
    private $db;

    public function __construct()
    {
        $this->db = (new DatabaseConnection())->getConnection();
    }

    public function getDashboard($request, $response)
    {
        $totalProducts = $this->db->query("SELECT COUNT(*) as count FROM products")->fetch()['count'];
        $totalCategories = $this->db->query("SELECT COUNT(*) as count FROM categories")->fetch()['count'];
        $totalReviews = 0;
        try { $totalReviews = $this->db->query("SELECT COUNT(*) as count FROM reviews")->fetch()['count']; } catch (Exception $e) { $totalReviews = 0; }
        $totalOffers = $this->db->query("SELECT COUNT(*) as count FROM offers")->fetch()['count'];
        $totalLikes = $this->db->query("SELECT SUM(likes_count) as total FROM products")->fetch()['total'] ?? 0;
        $totalOrders = $this->db->query("SELECT SUM(stock) as total FROM products")->fetch()['total'] ?? 0;
        $featuredCount = $this->db->query("SELECT COUNT(*) as count FROM products WHERE is_featured = TRUE")->fetch()['count'];
        $newArrivals = $this->db->query("SELECT COUNT(*) as count FROM products WHERE is_new_arrival = TRUE")->fetch()['count'];

        $recentProducts = $this->db->query("SELECT id, name, price, stock, created_at FROM products ORDER BY created_at DESC LIMIT 5")->fetchAll();
        $recentReviews = [];
        try { $recentReviews = $this->db->query("SELECT r.id, r.user_name, r.rating, r.created_at, p.name as product_name FROM reviews r JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC LIMIT 5")->fetchAll(); } catch (Exception $e) { $recentReviews = []; }

        $topProducts = $this->db->query("SELECT id, name, likes_count FROM products ORDER BY likes_count DESC LIMIT 5")->fetchAll();

        $response->setJson([
            'stats' => [
                'total_products' => (int)$totalProducts,
                'total_categories' => (int)$totalCategories,
                'total_reviews' => (int)$totalReviews,
                'total_offers' => (int)$totalOffers,
                'total_likes' => (int)$totalLikes,
                'total_inventory' => (int)$totalOrders,
                'featured_count' => (int)$featuredCount,
                'new_arrivals' => (int)$newArrivals,
            ],
            'recent_products' => $recentProducts,
            'recent_reviews' => $recentReviews,
            'top_liked_products' => $topProducts,
        ]);
    }
}
