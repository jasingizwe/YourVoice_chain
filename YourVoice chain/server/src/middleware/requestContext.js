import crypto from 'crypto';

export function attachRequestContext(req, res, next) {
  req.requestId = crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
}
