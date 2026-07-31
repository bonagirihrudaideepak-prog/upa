<?php
class FileUploadService
{
    private $uploadPath;
    private $allowedExtensions;
    private $maxSize;

    public function __construct()
    {
        $this->uploadPath = __DIR__ . '/../../uploads';
        $this->allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $this->maxSize = 10 * 1024 * 1024;

        if (!file_exists($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
    }

    public function upload($file, $prefix = '')
    {
        if (!isset($file['name']) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Invalid file upload');
        }

        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new Exception("File type '{$extension}' is not allowed");
        }

        if ($file['size'] > $this->maxSize) {
            throw new Exception('File size exceeds 10MB limit');
        }

        $filename = $prefix . uniqid() . '.' . $extension;
        $targetPath = $this->uploadPath . '/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Failed to move uploaded file');
        }

        return 'uploads/' . $filename;
    }

    public function delete($path)
    {
        $fullPath = __DIR__ . '/../../' . $path;
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }

    public function getUploadPath()
    {
        return $this->uploadPath;
    }
}
