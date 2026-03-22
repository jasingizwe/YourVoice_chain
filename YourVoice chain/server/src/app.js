import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes/index.js';
import { notFound, onError } from './middleware/error.js';
import { env } from './config/env.js';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit.js';
import { runHealthChecks } from './services/health.js';
import { attachRequestContext } from './middleware/requestContext.js';

export function createApp() {
  const app = express();
  const isProd = env.NODE_ENV === 'production';
  const allowlist = new Set(env.CORS_ALLOWLIST);

  morgan.token('request-id', req => req.requestId || '-');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (!isProd) return callback(null, true);
        if (allowlist.has(origin)) return callback(null, true);
        const err = new Error('CORS origin not allowed');
        err.status = 403;
        return callback(err);
      },
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: env.API_JSON_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.API_FORM_LIMIT }));
  app.use(attachRequestContext);
  app.use(morgan(':method :url :status :response-time ms - reqId=:request-id'));

  app.get('/health', async (_req, res) => {
    const health = await runHealthChecks();
    res.status(health.ok ? 200 : 503).json(health);
  });

  app.use('/api/v1/auth', authRateLimiter);
  app.use('/api/v1', apiRateLimiter, apiRouter);

  app.use(notFound);
  app.use(onError);

  return app;
}
