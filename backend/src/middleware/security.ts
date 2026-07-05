import helmet from 'helmet';
import cors from 'cors';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const security: RequestHandler[] = [
  helmet(),
  cors({ origin: env.CORS_ORIGIN }),
];
