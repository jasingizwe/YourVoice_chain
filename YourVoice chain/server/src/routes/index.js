import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { casesRouter } from './cases.routes.js';
import { adminRouter } from './admin.routes.js';
import { auditRouter } from './audit.routes.js';
import { notificationsRouter } from './notifications.routes.js';
import { metricsRouter } from './metrics.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/cases', casesRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/audit-logs', auditRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/metrics', metricsRouter);
