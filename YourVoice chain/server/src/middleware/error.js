import { logError, logWarn } from '../services/logger.js';

export function notFound(_req, res) {
  logWarn('Route not found', {
    requestId: _req.requestId,
    method: _req.method,
    path: _req.originalUrl,
  });
  res.status(404).json({ error: 'Route not found' });
}

export function onError(err, req, res, _next) {
  const status = Number(err?.status || 500);
  const message = err?.message || 'Internal server error';
  logError('Request failed', err, {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    userId: req.user?.sub,
  });
  res.status(status).json({ error: message });
}
