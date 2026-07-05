import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as agentService from '../services/agentService.js';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const agents = await agentService.listAgents();
  res.json({ data: agents });
});
