const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function loadJwtSecret() {
  const env = process.env.JWT_SECRET;
  if (env) return env;

  const isProd = (process.env.NODE_ENV || 'production') === 'production';
  if (isProd) {
    // Fail closed: never fall back to a hardcoded, publicly known secret.
    throw new Error('JWT_SECRET is required in production. Set process.env.JWT_SECRET.');
  }

  // Non-production only: ephemeral random secret (tokens do not survive restarts).
  const ephemeral = crypto.randomBytes(48).toString('hex');
  console.warn('[SECURITY] JWT_SECRET not set; using an ephemeral random secret. Sessions will not persist across restarts.');
  return ephemeral;
}

const JWT_SECRET = loadJwtSecret();

function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Admin login required' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

module.exports = {
  JWT_SECRET,
  verifyAdmin
};
