import { Router } from 'express';
import { salesOrderController } from '../controllers/index.js';
import { authenticate, authorize, validate } from '../middleware/index.js';
import { dispatchOrderSchema } from '../validators/index.js';

const router = Router();

// All sales order routes require authentication
router.use(authenticate);

// GET /api/sales-orders
router.get('/', (req, res, next) => salesOrderController.findAll(req, res, next));

// GET /api/sales-orders/:id
router.get('/:id', (req, res, next) => salesOrderController.findById(req, res, next));

// POST /api/sales-orders/:id/confirm  — ADMIN only
router.post(
  '/:id/confirm',
  authorize('ADMIN'),
  (req, res, next) => salesOrderController.confirm(req, res, next)
);

// POST /api/sales-orders/:id/dispatch — ADMIN only
router.post(
  '/:id/dispatch',
  authorize('ADMIN'),
  validate(dispatchOrderSchema),
  (req, res, next) => salesOrderController.dispatch(req, res, next)
);

// PATCH /api/sales-orders/:id/cancel  — ADMIN only
router.patch(
  '/:id/cancel',
  authorize('ADMIN'),
  (req, res, next) => salesOrderController.cancel(req, res, next)
);

export default router;
