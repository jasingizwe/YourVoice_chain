import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
import { pinFileAndGetCid } from '../services/ipfs.js';
import { env } from '../config/env.js';

const createCaseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  incidentDate: z.string().optional().nullable(),
});

const updateCaseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  incidentDate: z.string().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'closed']).optional(),
});

const createNoteSchema = z.object({
  content: z.string().min(3),
});

const createGrantSchema = z.object({
  authorityEmail: z.string().email(),
});

const updateGrantTxSchema = z.object({
  grantTx: z.string().max(256).optional(),
  revokeTx: z.string().max(256).optional(),
});

const createEvidenceSchema = z.object({
  fileName: z.string().min(1),
  evidenceType: z.string().optional(),
});

const updateEvidenceTxSchema = z.object({
  txHash: z.string().min(10).max(256),
});

const updateCaseOnchainSchema = z.object({
  onchainCaseId: z.string().min(1).max(128),
  txHash: z.string().min(10).max(256).optional(),
});

export const casesRouter = Router();
const allowedUploadMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

function detectMagicType(buffer) {
  if (!buffer || buffer.length < 4) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }
  return null;
}

function sanitizeFilename(name) {
  const clean = (name || 'evidence')
    .replace(/[^\w.\- ]+/g, '_')
    .trim()
    .slice(0, 160);
  return clean || 'evidence';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.EVIDENCE_MAX_FILE_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowedUploadMimeTypes.has(file.mimetype)) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    return cb(null, true);
  },
});

casesRouter.use(requireAuth);

async function getCaseRow(caseId) {
  const found = await pool.query('select * from cases where id = $1', [caseId]);
  return found.rows[0] || null;
}

async function canAccessCase(caseId, userId, role) {
  if (role === 'admin') return true;

  const found = await pool.query(
    `select c.id
     from cases c
     where c.id = $1
       and (
         c.survivor_id = $2
         or exists (
           select 1
           from access_grants g
           where g.case_id = c.id
             and g.authority_id = $2
             and g.revoked_at is null
         )
       )
     limit 1`,
    [caseId, userId],
  );
  return !!found.rowCount;
}

casesRouter.get('/', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const role = req.user.role;

    if (role === 'admin') {
      const all = await pool.query('select * from cases order by created_at desc');
      return res.json({ items: all.rows });
    }

    if (role === 'authority') {
      const granted = await pool.query(
        `select c.*
         from cases c
         join access_grants g on g.case_id = c.id
         where g.authority_id = $1 and g.revoked_at is null
         order by c.updated_at desc`,
        [userId],
      );
      return res.json({ items: granted.rows });
    }

    const own = await pool.query('select * from cases where survivor_id = $1 order by created_at desc', [userId]);
    return res.json({ items: own.rows });
  } catch (err) {
    return next(err);
  }
});

casesRouter.post('/', async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const role = req.user.role;
    if (!['survivor', 'admin'].includes(role)) {
      return res.status(403).json({ error: 'Only survivors/admin can create cases' });
    }
    const input = createCaseSchema.parse(req.body);
    const inserted = await pool.query(
      `insert into cases (survivor_id, title, description, incident_date)
       values ($1, $2, $3, $4)
       returning *`,
      [userId, input.title, input.description, input.incidentDate ?? null],
    );

    await logAudit({
      userId,
      caseId: inserted.rows[0].id,
      action: 'case_submitted',
      details: { title: input.title },
    });

    return res.status(201).json({ item: inserted.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.post('/:id/notes', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;
    if (!['authority', 'admin'].includes(role)) {
      return res.status(403).json({ error: 'Only authority/admin can add notes' });
    }

    const access = await canAccessCase(caseId, userId, role);
    if (!access) return res.status(403).json({ error: 'Not allowed' });

    const input = createNoteSchema.parse(req.body);
    const inserted = await pool.query(
      `insert into case_notes (case_id, author_id, content)
       values ($1, $2, $3)
       returning *`,
      [caseId, userId, input.content],
    );

    await logAudit({
      userId,
      caseId,
      action: 'note_added',
      details: null,
    });

    return res.status(201).json({ item: inserted.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.post('/:id/grants', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;
    const input = createGrantSchema.parse(req.body);

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });

    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const authorityUser = await pool.query(
      `select id, role, wallet_address from users where lower(email) = lower($1) limit 1`,
      [input.authorityEmail],
    );
    if (!authorityUser.rowCount) {
      return res.status(404).json({ error: 'Authority user not found' });
    }
    if (!['authority', 'admin'].includes(authorityUser.rows[0].role)) {
      return res.status(400).json({ error: 'Target user is not authority/admin' });
    }

    const existing = await pool.query(
      `select * from access_grants where case_id = $1 and authority_id = $2 order by granted_at desc limit 1`,
      [caseId, authorityUser.rows[0].id],
    );
    if (existing.rowCount && !existing.rows[0].revoked_at) {
      return res.json({ item: existing.rows[0] });
    }

    if (existing.rowCount && existing.rows[0].revoked_at) {
      const reactivated = await pool.query(
        `update access_grants
         set revoked_at = null, granted_by = $2, granted_at = now(), authority_wallet_address = $3, grant_tx = null
         where id = $1
         returning *`,
        [existing.rows[0].id, userId, authorityUser.rows[0].wallet_address || null],
      );
      await logAudit({
        userId,
        caseId,
        action: 'access_granted',
        details: { authorityId: authorityUser.rows[0].id },
      });
      return res.json({ item: reactivated.rows[0] });
    }

    const inserted = await pool.query(
      `insert into access_grants (case_id, authority_id, granted_by, authority_wallet_address)
       values ($1, $2, $3, $4)
       returning *`,
      [caseId, authorityUser.rows[0].id, userId, authorityUser.rows[0].wallet_address || null],
    );

    await logAudit({
      userId,
      caseId,
      action: 'access_granted',
      details: { authorityId: authorityUser.rows[0].id },
    });

    return res.status(201).json({ item: inserted.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/grants/:id/revoke', async (req, res, next) => {
  try {
    const grantId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;

    const grant = await pool.query('select * from access_grants where id = $1 limit 1', [grantId]);
    if (!grant.rowCount) return res.status(404).json({ error: 'Grant not found' });

    const caseRow = await getCaseRow(grant.rows[0].case_id);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });

    if (!(role === 'admin' || caseRow.survivor_id === userId || grant.rows[0].granted_by === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await pool.query(
      `update access_grants
       set revoked_at = now()
       where id = $1
       returning *`,
      [grantId],
    );

    await logAudit({
      userId,
      caseId: grant.rows[0].case_id,
      action: 'access_revoked',
      details: { grantId },
    });

    return res.json({ item: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/grants/:id/tx', async (req, res, next) => {
  try {
    const grantId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;
    const input = updateGrantTxSchema.parse(req.body);
    if (!input.grantTx && !input.revokeTx) {
      return res.status(400).json({ error: 'No tx provided' });
    }

    const grant = await pool.query('select * from access_grants where id = $1 limit 1', [grantId]);
    if (!grant.rowCount) return res.status(404).json({ error: 'Grant not found' });

    const caseRow = await getCaseRow(grant.rows[0].case_id);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });

    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await pool.query(
      `update access_grants
       set grant_tx = coalesce($1, grant_tx),
           revoke_tx = coalesce($2, revoke_tx)
       where id = $3
       returning *`,
      [input.grantTx || null, input.revokeTx || null, grantId],
    );

    await logAudit({
      userId,
      caseId: grant.rows[0].case_id,
      action: 'access_grant_tx_recorded',
      details: { grantId, grantTx: !!input.grantTx, revokeTx: !!input.revokeTx },
    });

    return res.json({ item: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.post('/:id/evidence', upload.single('file'), async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    let fileName = '';
    let evidenceType = 'document';
    let ipfsHash = '';

    if (req.file) {
      const magicType = detectMagicType(req.file.buffer);
      if (!magicType || magicType !== req.file.mimetype) {
        return res.status(400).json({ error: 'Invalid file content/type mismatch' });
      }
      fileName = sanitizeFilename(req.file.originalname);
      evidenceType = req.file.mimetype?.startsWith('image/') ? 'image' : 'document';
      const pin = await pinFileAndGetCid(req.file);
      ipfsHash = pin.cid;
    } else {
      const input = createEvidenceSchema.parse(req.body);
      fileName = sanitizeFilename(input.fileName);
      evidenceType = input.evidenceType || 'document';
      ipfsHash = `local-${Date.now()}`;
    }

    const inserted = await pool.query(
      `insert into evidence (case_id, survivor_id, evidence_type, file_name, ipfs_hash, blockchain_tx)
       values ($1, $2, $3, $4, $5, $6)
       returning *`,
      [
        caseId,
        caseRow.survivor_id,
        evidenceType,
        fileName,
        ipfsHash,
        null,
      ],
    );

    await logAudit({
      userId,
      caseId,
      action: 'evidence_uploaded',
      details: { fileName, evidenceType, ipfsHash },
    });

    return res.status(201).json({ item: inserted.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/:caseId/evidence/:evidenceId/tx', async (req, res, next) => {
  try {
    const { caseId, evidenceId } = req.params;
    const userId = req.user.sub;
    const role = req.user.role;
    const input = updateEvidenceTxSchema.parse(req.body);

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await pool.query(
      `update evidence
       set blockchain_tx = $1
       where id = $2 and case_id = $3
       returning *`,
      [input.txHash, evidenceId, caseId],
    );

    if (!updated.rowCount) return res.status(404).json({ error: 'Evidence not found' });

    await logAudit({
      userId,
      caseId,
      action: 'evidence_tx_recorded',
      details: { evidenceId, txHash: input.txHash },
    });

    return res.json({ item: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.delete('/:caseId/evidence/:evidenceId', async (req, res, next) => {
  try {
    const { caseId, evidenceId } = req.params;
    const userId = req.user.sub;
    const role = req.user.role;

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const deleted = await pool.query(
      `update evidence
       set deleted_at = now(), deleted_by = $3
       where id = $1 and case_id = $2 and deleted_at is null
       returning id`,
      [evidenceId, caseId, userId],
    );

    if (!deleted.rowCount) return res.status(404).json({ error: 'Evidence not found' });

    await logAudit({
      userId,
      caseId,
      action: 'evidence_soft_deleted',
      details: { evidenceId },
    });

    return res.json({ deleted: true });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/:id/onchain', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;
    const input = updateCaseOnchainSchema.parse(req.body);

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await pool.query(
      `update cases
       set onchain_case_id = $1,
           onchain_case_tx = coalesce($2, onchain_case_tx),
           updated_at = now()
       where id = $3
       returning *`,
      [input.onchainCaseId, input.txHash || null, caseId],
    );

    await logAudit({
      userId,
      caseId,
      action: 'case_onchain_linked',
      details: { onchainCaseId: input.onchainCaseId, txHash: input.txHash || null },
    });

    return res.json({ item: updated.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/:caseId/evidence/:evidenceId/restore', async (req, res, next) => {
  try {
    const { caseId, evidenceId } = req.params;
    const userId = req.user.sub;
    const role = req.user.role;

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!(role === 'admin' || caseRow.survivor_id === userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const restored = await pool.query(
      `update evidence
       set deleted_at = null, deleted_by = null
       where id = $1 and case_id = $2 and deleted_at is not null
       returning *`,
      [evidenceId, caseId],
    );

    if (!restored.rowCount) return res.status(404).json({ error: 'Deleted evidence not found' });

    await logAudit({
      userId,
      caseId,
      action: 'evidence_restored',
      details: { evidenceId },
    });

    return res.json({ item: restored.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.get('/:id', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;

    const access = await canAccessCase(caseId, userId, role);
    if (!access) return res.status(403).json({ error: 'Not allowed' });

    const found = await pool.query('select * from cases where id = $1', [caseId]);
    if (!found.rowCount) return res.status(404).json({ error: 'Case not found' });

    const [evidence, grants, notes] = await Promise.all([
      pool.query('select * from evidence where case_id = $1 and deleted_at is null order by uploaded_at desc', [caseId]),
      pool.query(
        `select g.*, u.email as authority_email, u.wallet_address as authority_wallet_address
         from access_grants g
         join users u on u.id = g.authority_id
         where g.case_id = $1
         order by g.granted_at desc`,
        [caseId],
      ),
      pool.query('select * from case_notes where case_id = $1 order by created_at desc', [caseId]),
    ]);

    return res.json({
      item: found.rows[0],
      evidence: evidence.rows,
      grants: grants.rows,
      notes: notes.rows,
    });
  } catch (err) {
    return next(err);
  }
});

casesRouter.patch('/:id', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;
    const input = updateCaseSchema.parse(req.body);

    const caseRow = await getCaseRow(caseId);
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });

    const isOwner = caseRow.survivor_id === userId;
    const authorityAccess = await canAccessCase(caseId, userId, role);

    if (!(role === 'admin' || isOwner || authorityAccess)) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const onlyStatus = input.status && !input.title && !input.description && input.incidentDate === undefined;
    if (!isOwner && role === 'authority' && !onlyStatus) {
      return res.status(403).json({ error: 'Authority can only update status' });
    }

    const payload = {
      title: input.title,
      description: input.description,
      incident_date: input.incidentDate,
      status: input.status,
    };

    const keys = Object.keys(payload).filter(k => payload[k] !== undefined);
    if (!keys.length) return res.status(400).json({ error: 'No changes provided' });

    const updates = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => payload[k]);
    const result = await pool.query(
      `update cases set ${updates}, updated_at = now() where id = $${keys.length + 1} returning *`,
      [...values, caseId],
    );

    await logAudit({
      userId,
      caseId,
      action: keys.length === 1 && keys[0] === 'status' ? 'status_updated' : 'case_updated',
      details: { fields: keys },
    });

    return res.json({ item: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

casesRouter.delete('/:id', async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.user.sub;
    const role = req.user.role;

    const sql =
      role === 'admin'
        ? 'delete from cases where id = $1 returning id'
        : 'delete from cases where id = $1 and survivor_id = $2 returning id';
    const values = role === 'admin' ? [caseId] : [caseId, userId];

    const deleted = await pool.query(sql, values);
    if (!deleted.rowCount) return res.status(404).json({ error: 'Case not found or not allowed' });

    await logAudit({
      userId,
      caseId,
      action: 'case_deleted',
      details: { byRole: role },
    });

    return res.json({ deleted: true });
  } catch (err) {
    return next(err);
  }
});
