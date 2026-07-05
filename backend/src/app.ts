import express, { type Express } from 'express';
import { security } from './middleware/security.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRateLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import ticketRoutes from './routes/tickets.js';
import agentRoutes from './routes/agents.js';
import dashboardRoutes from './routes/dashboard.js';

export function createApp(): Express {
  const app = express();

  app.use(security);
  app.use(express.json());
  app.use(requestLogger);

  app.use('/api', apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/tickets', ticketRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
