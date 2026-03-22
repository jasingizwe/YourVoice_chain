import fs from 'fs/promises';
import path from 'path';
import { pool } from '../db/pool.js';
import { pinFileFromPath } from './ipfs.js';
import { logAudit } from './audit.js';
import { logInfo, logWarn } from './logger.js';
import { env } from '../config/env.js';

const RETRY_INTERVAL_MS = Number(process.env.IPFS_RETRY_INTERVAL_MS ?? 60_000);
const MAX_ATTEMPTS = Number(process.env.IPFS_RETRY_MAX ?? 5);

async function retryPendingPins() {
  const candidates = await pool.query(
    `select id, case_id, file_name, local_path, ipfs_attempts
     from evidence
     where ipfs_status in ('pending', 'failed')
       and local_path is not null
       and ipfs_attempts < $1
       and (ipfs_last_attempt_at is null or ipfs_last_attempt_at < now() - interval '1 minute')
     order by uploaded_at asc
     limit 5`,
    [MAX_ATTEMPTS],
  );

  if (!candidates.rowCount) return;

  for (const row of candidates.rows) {
    try {
      const { cid } = await pinFileFromPath(row.local_path, {
        mimetype: null,
        originalname: row.file_name || 'evidence',
      });

      await pool.query(
        `update evidence
         set ipfs_hash = $1,
             ipfs_status = 'pinned',
             ipfs_attempts = ipfs_attempts + 1,
             ipfs_last_error = null,
             ipfs_last_attempt_at = now(),
             local_path = null
         where id = $2`,
        [cid, row.id],
      );

      try {
        await fs.unlink(row.local_path);
      } catch {
        // best effort cleanup
      }

      await logAudit({
        userId: null,
        caseId: row.case_id,
        action: 'evidence_ipfs_retry_success',
        details: { evidenceId: row.id, cid },
      });
    } catch (err) {
      const message = err?.message || 'IPFS retry failed';
      await pool.query(
        `update evidence
         set ipfs_status = 'failed',
             ipfs_attempts = ipfs_attempts + 1,
             ipfs_last_error = $1,
             ipfs_last_attempt_at = now()
         where id = $2`,
        [message, row.id],
      );

      await logAudit({
        userId: null,
        caseId: row.case_id,
        action: 'evidence_ipfs_retry_failed',
        details: { evidenceId: row.id, error: message },
      });

      logWarn('IPFS retry failed', { evidenceId: row.id, error: message });
    }
  }
}

export function startIpfsRetryLoop() {
  if (!env.PINATA_JWT) {
    logInfo('IPFS retry loop disabled (PINATA_JWT not configured)');
    return;
  }

  setInterval(() => {
    retryPendingPins().catch(err => {
      logWarn('IPFS retry loop error', { error: err?.message || String(err) });
    });
  }, RETRY_INTERVAL_MS);

  logInfo('IPFS retry loop started', { intervalMs: RETRY_INTERVAL_MS, maxAttempts: MAX_ATTEMPTS });
}
