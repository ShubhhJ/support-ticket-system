import { Router } from 'express';
import * as agentController from '../controllers/agentController.js';

const router = Router();

router.get('/', agentController.list);

export default router;
