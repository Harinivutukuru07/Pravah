import { Router } from 'express';
import { quotationController } from '../controllers/index.js';
import { authenticate, authorize, validate } from '../middleware/index.js';
import { createQuotationSchema, updateQuotationStatusSchema } from '../validators/index.js';

const router = Router();

// All quotation routes require authentication
router.use(authenticate);

// POST /api/quotations
router.post(
  '/',
  authorize('SALES_USER', 'ADMIN'),
  validate(createQuotationSchema),
  (req, res, next) => quotationController.create(req, res, next)
);

// GET /api/quotations
router.get('/', (req, res, next) => quotationController.findAll(req, res, next));

// GET /api/quotations/:id
router.get('/:id', (req, res, next) => quotationController.findById(req, res, next));

// PATCH /api/quotations/:id/status
router.patch(
  '/:id/status',
  authorize('SALES_USER', 'ADMIN'),
  validate(updateQuotationStatusSchema),
  (req, res, next) => quotationController.updateStatus(req, res, next)
);

// POST /api/quotations/:id/convert
router.post(
  '/:id/convert',
  authorize('SALES_USER', 'ADMIN'),
  (req, res, next) => quotationController.convertToSalesOrder(req, res, next)
);

export default router;
