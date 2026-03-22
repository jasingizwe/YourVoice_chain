import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../db/pool.js';

export async function requireAuth(req, res, next) {
  const cookieToken = req.cookies?.auth_token || null;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const found = await pool.query('select id, email, role from users where id = $1', [payload.sub]);
    if (!found.rowCount) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = found.rows[0];
    req.user = {
      ...payload,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
