<?php
class OfferController
{
    private $db;

    public function __construct()
    {
        $this->db = (new DatabaseConnection())->getConnection();
    }

    public function getAll($request, $response)
    {
        $stmt = $this->db->query("SELECT * FROM offers WHERE is_active = TRUE ORDER BY created_at DESC");
        $response->setJson($stmt->fetchAll());
    }

    public function getAdminAll($request, $response)
    {
        $stmt = $this->db->query("SELECT * FROM offers ORDER BY created_at DESC");
        $response->setJson($stmt->fetchAll());
    }

    public function create($request, $response)
    {
        $data = $request['input'] ?? [];
        if (empty($data['title'])) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Title is required']);
            return;
        }
        $stmt = $this->db->prepare("INSERT INTO offers (title, description, image_path, link, is_active) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['description'] ?? null,
            $data['image_path'] ?? null,
            $data['link'] ?? null,
            !empty($data['is_active']) ? 1 : 0,
        ]);
        $response->setStatusCode(201);
        $response->setJson(['id' => $this->db->lastInsertId(), 'message' => 'Offer created']);
    }

    public function update($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;
        $data = $request['input'] ?? [];
        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Offer ID is required']);
            return;
        }
        $fields = [];
        $values = [];
        foreach (['title', 'description', 'image_path', 'link', 'is_active'] as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "`$f` = ?";
                $values[] = $f === 'is_active' ? (!empty($data[$f]) ? 1 : 0) : $data[$f];
            }
        }
        if (!empty($fields)) {
            $values[] = $id;
            $stmt = $this->db->prepare("UPDATE offers SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
        }
        $response->setJson(['message' => 'Offer updated']);
    }

    public function delete($request, $response)
    {
        $params = $request['params'] ?? [];
        $id = $params[0] ?? null;
        if (!$id) {
            $response->setStatusCode(400);
            $response->setJson(['error' => 'Offer ID is required']);
            return;
        }
        $stmt = $this->db->prepare("DELETE FROM offers WHERE id = ?");
        $stmt->execute([$id]);
        $response->setJson(['message' => 'Offer deleted']);
    }
}
