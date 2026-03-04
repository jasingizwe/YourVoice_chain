import { pool } from '../db/pool.js';
import { env } from '../config/env.js';

const PINATA_TEST_URL = 'https://api.pinata.cloud/data/testAuthentication';

async function checkDatabase() {
  const started = Date.now();
  await pool.query('select 1');
  return {
    ok: true,
    latencyMs: Date.now() - started,
  };
}

async function checkPinata() {
  if (!env.PINATA_JWT) {
    return {
      ok: true,
      configured: false,
      skipped: true,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const started = Date.now();
    const response = await fetch(PINATA_TEST_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${env.PINATA_JWT}` },
      signal: controller.signal,
    });

    if (!response.ok) {
      const details = await response.text();
      return {
        ok: false,
        configured: true,
        status: response.status,
        details: details.slice(0, 300),
      };
    }

    return {
      ok: true,
      configured: true,
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return {
      ok: false,
      configured: true,
      details: err?.message || 'pinata check failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runHealthChecks() {
  const [dbResult, pinataResult] = await Promise.allSettled([checkDatabase(), checkPinata()]);

  const db = dbResult.status === 'fulfilled' ? dbResult.value : { ok: false, details: dbResult.reason?.message || 'db check failed' };
  const pinata =
    pinataResult.status === 'fulfilled' ? pinataResult.value : { ok: false, details: pinataResult.reason?.message || 'pinata check failed' };

  const ok = Boolean(db.ok && pinata.ok);

  return {
    ok,
    checks: {
      database: db,
      pinata,
    },
  };
}
