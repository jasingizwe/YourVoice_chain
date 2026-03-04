import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';

const createNotificationSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(2).max(120).optional(),
  message: z.string().min(3).max(2000),
});

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const found = await pool.query(
      `select n.*,
              su.full_name as sender_name,
              c.title as case_title
       from notifications n
       left join users su on su.id = n.sender_user_id
       left join cases c on c.id = n.case_id
       where n.recipient_user_id = $1
       order by n.created_at desc
       limit $2`,
      [userId, limit],
    );

    return res.json({
      items: found.rows,
      unreadCount: found.rows.filter(item => !item.is_read).length,
    });
  } catch (err) {
    return next(err);
  }
});

notificationsRouter.post('/', async (req, res, next) => {
  try {
    const senderId = req.user.sub;
    const role = req.user.role;
    if (!['authority', 'admin'].includes(role)) {
      return res.status(403).json({ error: 'Only authority/admin can send updates' });
    }

    const input = createNotificationSchema.parse(req.body);
    const caseRes = await pool.query('select id, title, survivor_id from cases where id = $1 limit 1', [input.caseId]);
    if (!caseRes.rowCount) return res.status(404).json({ error: 'Case not found' });
    const caseRow = caseRes.rows[0];

    if (role === 'authority') {
      const hasGrant = await pool.query(
        `select id
         from access_grants
         where case_id = $1
           and authority_id = $2
           and revoked_at is null
         limit 1`,
        [caseRow.id, senderId],
      );
      if (!hasGrant.rowCount) {
        return res.status(403).json({ error: 'No access to this case' });
      }
    }

    const inserted = await pool.query(
      `insert into notifications (recipient_user_id, sender_user_id, case_id, title, message)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [caseRow.survivor_id, senderId, caseRow.id, input.title || `Update on ${caseRow.title}`, input.message],
    );

    await logAudit({
      userId: senderId,
      caseId: caseRow.id,
      action: 'notification_sent',
      details: { recipientUserId: caseRow.survivor_id },
    });

    return res.status(201).json({ item: inserted.rows[0] });
  } catch (err) {
    return next(err);
  }
});

notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const notificationId = req.params.id;

    const updated = await pool.query(
      `update notifications
       set is_read = true
       where id = $1
         and recipient_user_id = $2
       returning *`,
      [notificationId, userId],
    );

    if (!updated.rowCount) return res.status(404).json({ error: 'Notification not found' });
    return res.json({ item: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});

notificationsRouter.patch('/read-all', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    await pool.query(
      `update notifications
       set is_read = true
       where recipient_user_id = $1
         and is_read = false`,
      [userId],
    );
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
