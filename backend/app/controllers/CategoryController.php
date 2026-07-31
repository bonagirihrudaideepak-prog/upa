<?php
class CategoryController
{
    private $db;

    public function __construct()
    {
        $this->db = (new DatabaseConnection())->getConnection();
    }

    public function getAll($request, $response)
    {
        $stmt = $this->db->query("SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC");
        $response->setJson($stmt->fetchAll());
    }
}
