import { createApp } from './app.js';
import { env } from './config/env.js';
import { logError, logInfo } from './services/logger.js';
import { startIpfsRetryLoop } from './services/ipfsRetry.js';

// Fail fast in production if critical env vars are missing
if (env.NODE_ENV === 'production') {
  const required = { JWT_SECRET: env.JWT_SECRET, DATABASE_URL: env.DATABASE_URL };
  for (const [key, val] of Object.entries(required)) {
    if (!val) {
      console.error(`FATAL: ${key} environment variable is not set. Exiting.`);
      process.exit(1);
    }
  }
}

const app = createApp();

const server = app.listen(env.PORT, () => {
  logInfo('API started', { port: env.PORT, env: env.NODE_ENV });
  startIpfsRetryLoop();
});

process.on('unhandledRejection', reason => {
  logError('Unhandled promise rejection', reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', err => {
  logError('Uncaught exception', err);
  server.close(() => process.exit(1));
});
