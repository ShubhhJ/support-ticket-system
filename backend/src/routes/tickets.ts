import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as ticketController from '../controllers/ticketController.js';
import {
  idParamSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  updateStatusSchema,
  assignAgentSchema,
  addCommentSchema,
} from '../validators/ticketSchemas.js';

const router = Router();

router.post('/', validate(createTicketSchema), ticketController.create);
router.get('/', validate(listTicketsQuerySchema, 'query'), ticketController.list);
router.get('/:id', validate(idParamSchema, 'params'), ticketController.getById);

router.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  ticketController.updateStatus,
);

router.patch(
  '/:id/assign',
  validate(idParamSchema, 'params'),
  validate(assignAgentSchema),
  ticketController.assign,
);

router.post(
  '/:id/comments',
  validate(idParamSchema, 'params'),
  validate(addCommentSchema),
  ticketController.addComment,
);

export default router;
