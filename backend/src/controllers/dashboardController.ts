import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getStats();
  res.json({ data });
});
