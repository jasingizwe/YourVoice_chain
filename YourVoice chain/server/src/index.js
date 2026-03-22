import { createApp } from './app.js';
import { env } from './config/env.js';
import { logError, logInfo } from './services/logger.js';
import { startIpfsRetryLoop } from './services/ipfsRetry.js';

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
