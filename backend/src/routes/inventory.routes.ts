import { Router } from 'express';
import { inventoryController } from '../controllers/index.js';
import { authenticate, authorize, validate } from '../middleware/index.js';
import { updateInventorySchema } from '../validators/index.js';

const router = Router();

// All inventory routes require authentication
router.use(authenticate);

// GET /api/inventory
router.get('/', (req, res, next) => inventoryController.findAll(req, res, next));

// GET /api/inventory/:productId
router.get('/:productId', (req, res, next) =>
  inventoryController.findByProductId(req, res, next)
);

// PATCH /api/inventory/:productId — ADMIN only
router.patch(
  '/:productId',
  authorize('ADMIN'),
  validate(updateInventorySchema),
  (req, res, next) => inventoryController.updatePhysicalQuantity(req, res, next)
);

export default router;
