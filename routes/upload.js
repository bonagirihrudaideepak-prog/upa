const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyAdmin } = require('../middleware/auth');
const { isValidRasterImage, ALLOWED_UPLOAD_EXTS } = require('../middleware/imageValidation');

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
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_UPLOAD_EXTS.has(ext)) {
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
  // Verify actual image content (magic bytes) — reject SVG/HTML polyglots.
  if (!isValidRasterImage(req.file.path)) {
    fs.unlinkSync(req.file.path); // remove the rejected file
    return res.status(400).json({ error: 'Invalid image content: only JPG, PNG, WEBP, GIF images are allowed' });
  }
  const relPath = 'uploads/' + req.file.filename;
  res.json({ path: relPath, url: relPath });
}

function handleDelete(req, res) {
  const fileRelPath = req.body?.path || '';
  if (!fileRelPath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  // Path traversal protection: resolve the full path, then verify it is
  // strictly inside the uploads directory (no prefix-collision bypass).
  const uploadsDir = path.resolve(path.join(__dirname, '..', 'uploads'));
  const fullPath = path.resolve(path.join(__dirname, '..', fileRelPath));

  const relative = path.relative(uploadsDir, fullPath);
  const isInside = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);

  if (!isInside) {
    return res.status(403).json({ error: 'Access denied: path outside uploads directory' });
  }

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return res.json({ message: 'File deleted' });
  } else {
    return res.status(404).json({ error: 'File not found' });
  }
}

// All upload/delete routes require admin authentication
router.post('/upload', verifyAdmin, upload.single('file'), handleUpload);
router.post('/admin/upload', verifyAdmin, upload.single('file'), handleUpload);

router.delete('/upload', verifyAdmin, handleDelete);
router.delete('/admin/upload', verifyAdmin, handleDelete);

module.exports = router;
