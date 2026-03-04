import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.GLOBAL_RATE_WINDOW_MS,
  max: env.GLOBAL_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_WINDOW_MS,
  max: env.AUTH_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please wait and retry.' },
});
