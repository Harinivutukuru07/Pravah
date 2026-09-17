import { Router } from 'express';
import { enquiryController } from '../controllers/index.js';
import { authenticate, authorize, validate } from '../middleware/index.js';
import { createEnquirySchema } from '../validators/index.js';

const router = Router();

// All enquiry routes require authentication
router.use(authenticate);

// POST /api/enquiries
router.post(
  '/',
  authorize('SALES_USER', 'ADMIN'),
  validate(createEnquirySchema),
  (req, res, next) => enquiryController.create(req, res, next)
);

// GET /api/enquiries
router.get('/', (req, res, next) => enquiryController.findAll(req, res, next));

// GET /api/enquiries/:id
router.get('/:id', (req, res, next) => enquiryController.findById(req, res, next));

export default router;
