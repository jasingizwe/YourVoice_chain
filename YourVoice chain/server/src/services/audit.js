import { pool } from '../db/pool.js';

export async function logAudit({ userId = null, caseId = null, action, details = null }) {
  if (!action) return;

  try {
    await pool.query(
      `insert into audit_logs (user_id, case_id, action, details)
       values ($1, $2, $3, $4)`,
      [userId, caseId, action, details],
    );
  } catch {
    // best effort: audit failures should not break main request flow
  }
}
