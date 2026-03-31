import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
import { sendMail } from '../services/email.js';

const passwordPolicyMessage =
  'Password must be at least 10 chars and include uppercase, lowercase, number, and symbol';

function isStrongPassword(password) {
  if (password.length < env.PASSWORD_MIN_LENGTH) return false;
  return /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(env.PASSWORD_MIN_LENGTH).refine(isStrongPassword, {
    message: passwordPolicyMessage,
  }),
  role: z.enum(['survivor', 'authority', 'admin']).default('survivor'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(16),
  password: z.string().min(env.PASSWORD_MIN_LENGTH).refine(isStrongPassword, {
    message: passwordPolicyMessage,
  }),
});

const updateWalletSchema = z.object({
  walletAddress: z.string().min(8).max(128).nullable(),
});

const COOKIE_NAME = 'auth_token';
const isProd = process.env.NODE_ENV === 'production';

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const email = input.email.toLowerCase();

    const existing = await pool.query('select id from users where email = $1 limit 1', [email]);
    if (existing.rowCount) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(input.password, 10);
    const created = await pool.query(
      `insert into users (full_name, email, password_hash, role)
       values ($1, $2, $3, $4)
       returning id, full_name, email, role`,
      [input.fullName, email, hash, input.role],
    );

    const user = created.rows[0];
    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    await logAudit({
      userId: user.id,
      action: 'user_registered',
      details: { role: user.role },
    });

    setAuthCookie(res, token);
    return res.status(201).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const email = input.email.toLowerCase();

    const found = await pool.query(
      'select id, full_name, email, role, password_hash from users where email = $1 limit 1',
      [email],
    );

    const user = found.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    await logAudit({
      userId: user.id,
      action: 'user_logged_in',
      details: null,
    });

    setAuthCookie(res, token);
    return res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const found = await pool.query('select id, full_name, email, role, wallet_address from users where id = $1', [userId]);
    if (!found.rowCount) return res.status(404).json({ error: 'User not found' });
    const user = found.rows[0];

    return res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        walletAddress: user.wallet_address,
      },
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ ok: true });
});

authRouter.patch('/me/wallet', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const input = updateWalletSchema.parse(req.body);

    const updated = await pool.query(
      `update users
       set wallet_address = $1
       where id = $2
       returning id, full_name, email, role, wallet_address`,
      [input.walletAddress, userId],
    );

    if (!updated.rowCount) return res.status(404).json({ error: 'User not found' });

    await logAudit({
      userId,
      action: 'wallet_updated',
      details: { hasWallet: !!input.walletAddress },
    });

    const user = updated.rows[0];
    return res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        walletAddress: user.wallet_address,
      },
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const email = input.email.toLowerCase();
    const found = await pool.query('select id from users where email = $1 limit 1', [email]);

    if (!found.rowCount) {
      return res.json({ ok: true });
    }

    const userId = found.rows[0].id;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('update password_resets set used_at = now() where user_id = $1 and used_at is null', [userId]);
      await client.query(
        `insert into password_resets (user_id, token_hash, expires_at)
         values ($1, $2, now() + interval '30 minutes')`,
        [userId, tokenHash],
      );
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    await logAudit({
      userId,
      action: 'password_reset_requested',
      details: null,
    });

    const resetLink = `${env.APP_URL}/reset-password?token=${rawToken}`;
    await sendMail({
      to: email,
      subject: 'YourVoice — Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #f9c8d4; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 22px; color: #1a1a1a;">YourVoice</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #fbcfe8; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="margin-top: 0; font-size: 18px;">Reset your password</h2>
            <p style="color: #555; line-height: 1.6;">
              We received a request to reset your password. Click the button below to choose a new one.
              This link expires in <strong>30 minutes</strong>.
            </p>
            <a href="${resetLink}"
               style="display: inline-block; margin-top: 8px; background: #c0394b; color: #ffffff;
                      text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
            <p style="margin-top: 24px; color: #555; line-height: 1.6;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
            <p style="margin-top: 32px; font-size: 12px; color: #999;">
              This link will expire in 30 minutes for your security.
            </p>
          </div>
        </div>
      `,
    });

    const payload = { ok: true };
    if (env.NODE_ENV !== 'production') {
      payload.resetToken = rawToken;
    }
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const input = resetPasswordSchema.parse(req.body);
    const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');

    const found = await pool.query(
      `select id, user_id
       from password_resets
       where token_hash = $1
         and used_at is null
         and expires_at > now()
       limit 1`,
      [tokenHash],
    );

    if (!found.rowCount) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const reset = found.rows[0];
    const newHash = await bcrypt.hash(input.password, 10);

    await pool.query('update users set password_hash = $1 where id = $2', [newHash, reset.user_id]);
    await pool.query('update password_resets set used_at = now() where id = $1', [reset.id]);

    await logAudit({
      userId: reset.user_id,
      action: 'password_reset_completed',
      details: null,
    });

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
