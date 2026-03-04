import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

export const metricsRouter = Router();

metricsRouter.use(requireAuth, requireRole('admin'));

metricsRouter.get('/evaluation', async (req, res, next) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);

    const [totalsRes, evidenceRes, repeatRes, accessRes, coordinationRes] = await Promise.all([
      pool.query(
        `select
           (select count(*)::int from cases) as total_cases,
           (select count(*)::int from users where role = 'survivor') as total_survivors,
           (select count(*)::int from users where role = 'authority') as total_authorities`,
      ),
      pool.query(
        `select
           count(*)::int as total_evidence,
           count(*) filter (where ipfs_hash is not null and ipfs_hash <> '' and ipfs_hash not like 'local-%')::int as ipfs_pinned,
           count(*) filter (where blockchain_tx is not null and blockchain_tx <> '')::int as blockchain_anchored
         from evidence
         where deleted_at is null`,
      ),
      pool.query(
        `with survivor_case_counts as (
           select survivor_id, count(*)::int as cnt
           from cases
           group by survivor_id
         )
         select
           coalesce(avg(cnt)::numeric, 0) as avg_cases_per_survivor,
           count(*) filter (where cnt > 1)::int as survivors_with_multiple_cases
         from survivor_case_counts`,
      ),
      pool.query(
        `select
           count(*) filter (where granted_at >= now() - ($1::text || ' days')::interval)::int as grants_last_window,
           count(*) filter (where revoked_at is not null and revoked_at >= now() - ($1::text || ' days')::interval)::int as revokes_last_window,
           count(*) filter (where grant_tx is not null and grant_tx <> '')::int as onchain_grants_total,
           count(*) filter (where revoke_tx is not null and revoke_tx <> '')::int as onchain_revokes_total
         from access_grants`,
        [days],
      ),
      pool.query(
        `with first_authority_note as (
           select
             c.id as case_id,
             c.created_at as case_created_at,
             min(n.created_at) as first_note_at
           from cases c
           left join case_notes n on n.case_id = c.id
           left join users u on u.id = n.author_id
           where u.role = 'authority'
           group by c.id, c.created_at
         )
         select
           (select count(*)::int from case_notes n join users u on u.id = n.author_id where u.role = 'authority'
            and n.created_at >= now() - ($1::text || ' days')::interval) as authority_notes_last_window,
           (select count(*)::int from notifications
            where created_at >= now() - ($1::text || ' days')::interval) as notifications_last_window,
           coalesce(avg(extract(epoch from (f.first_note_at - f.case_created_at)) / 3600), 0)::numeric(10,2) as avg_hours_to_first_authority_note
         from first_authority_note f`,
        [days],
      ),
    ]);

    const totals = totalsRes.rows[0];
    const evidence = evidenceRes.rows[0];
    const repeat = repeatRes.rows[0];
    const access = accessRes.rows[0];
    const coordination = coordinationRes.rows[0];

    const safeRate = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0);

    return res.json({
      windowDays: days,
      metrics: {
        secureEvidencePreservation: {
          totalEvidence: evidence.total_evidence,
          ipfsPinned: evidence.ipfs_pinned,
          blockchainAnchored: evidence.blockchain_anchored,
          ipfsPinRatePct: safeRate(evidence.ipfs_pinned, evidence.total_evidence),
          blockchainAnchorRatePct: safeRate(evidence.blockchain_anchored, evidence.total_evidence),
        },
        reducedRepeatReportingProxy: {
          totalCases: totals.total_cases,
          totalSurvivors: totals.total_survivors,
          avgCasesPerSurvivor: Number(repeat.avg_cases_per_survivor),
          survivorsWithMultipleCases: repeat.survivors_with_multiple_cases,
        },
        survivorControlledAccessEvents: {
          grantsLastWindow: access.grants_last_window,
          revokesLastWindow: access.revokes_last_window,
          onchainGrantsTotal: access.onchain_grants_total,
          onchainRevokesTotal: access.onchain_revokes_total,
        },
        providerCoordination: {
          totalAuthorities: totals.total_authorities,
          authorityNotesLastWindow: coordination.authority_notes_last_window,
          survivorNotificationsLastWindow: coordination.notifications_last_window,
          avgHoursToFirstAuthorityNote: Number(coordination.avg_hours_to_first_authority_note),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
});
