const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'up_' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${ext}' is not allowed`));
    }
  }
});

function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const relPath = 'uploads/' + req.file.filename;
  res.json({ path: relPath, url: relPath });
}

function handleDelete(req, res) {
  const fileRelPath = req.body?.path || '';
  if (!fileRelPath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  // Clean relative path to avoid path traversal
  const cleanPath = path.normalize(fileRelPath).replace(/^(\.\.[\/\\])+/, '');
  const fullPath = path.join(__dirname, '..', cleanPath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return res.json({ message: 'File deleted' });
  } else {
    return res.status(404).json({ error: 'File not found' });
  }
}

// Support both /api/upload and /api/admin/upload for compatibility
router.post('/upload', upload.single('file'), handleUpload);
router.post('/admin/upload', verifyAdmin, upload.single('file'), handleUpload);

router.delete('/upload', handleDelete);
router.delete('/admin/upload', verifyAdmin, handleDelete);

module.exports = router;
