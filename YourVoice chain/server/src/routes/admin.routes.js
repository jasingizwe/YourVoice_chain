import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { logAudit } from '../services/audit.js';

const updateRoleSchema = z.object({
  role: z.enum(['survivor', 'authority', 'admin']),
});

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/overview', async (_req, res, next) => {
  try {
    const [usersRes, caseRes] = await Promise.all([
      pool.query(
        `select id, full_name, email, role, wallet_address, created_at
         from users
         order by created_at desc`,
      ),
      pool.query('select count(*)::int as count from cases'),
    ]);

    return res.json({
      users: usersRes.rows,
      caseCount: caseRes.rows[0]?.count || 0,
    });
  } catch (err) {
    return next(err);
  }
});

adminRouter.patch('/users/:id/role', async (req, res, next) => {
  try {
    const input = updateRoleSchema.parse(req.body);
    const targetUserId = req.params.id;
    const actorId = req.user.sub;

    if (targetUserId === actorId && input.role !== 'admin') {
      return res.status(400).json({ error: 'Admin cannot demote own account' });
    }

    const updated = await pool.query(
      `update users
       set role = $1
       where id = $2
       returning id, full_name, email, role, created_at`,
      [input.role, targetUserId],
    );

    if (!updated.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit({
      userId: actorId,
      action: 'user_role_updated',
      details: { targetUserId, role: input.role },
    });

    return res.json({ user: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});
