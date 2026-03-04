import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

export const auditRouter = Router();

auditRouter.use(requireAuth, requireRole('admin'));

auditRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const logs = await pool.query(
      `select id, user_id, case_id, action, details, created_at
       from audit_logs
       order by created_at desc
       limit $1`,
      [limit],
    );
    return res.json({ items: logs.rows });
  } catch (err) {
    return next(err);
  }
});
