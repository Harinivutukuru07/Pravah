import { Router } from 'express';
import { customerController } from '../controllers/index.js';
import { authenticate, authorize, validate } from '../middleware/index.js';
import { createCustomerSchema } from '../validators/index.js';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// POST /api/customers
router.post(
  '/',
  authorize('SALES_USER', 'ADMIN'),
  validate(createCustomerSchema),
  (req, res, next) => customerController.create(req, res, next)
);

// GET /api/customers
router.get('/', (req, res, next) => customerController.findAll(req, res, next));

// GET /api/customers/:id
router.get('/:id', (req, res, next) => customerController.findById(req, res, next));

export default router;
