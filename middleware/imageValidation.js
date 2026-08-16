const fs = require('fs');

// Verify a file is a real raster image by checking magic bytes (not just extension).
// Rejects SVG/HTML polyglots and files that merely pretend to be images.
function isValidRasterImage(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(16);
    const bytesRead = fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);
    if (bytesRead < 4) return false;

    // JPEG: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return true;
    // GIF: "GIF8"
    if (buf.slice(0, 4).toString('ascii') === 'GIF8') return true;
    // WEBP: "RIFF" .... "WEBP"
    if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return true;

    return false;
  } catch (err) {
    return false;
  }
}

// Allowed upload extensions (kept in sync with the magic-byte checks above).
const ALLOWED_UPLOAD_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

module.exports = { isValidRasterImage, ALLOWED_UPLOAD_EXTS };