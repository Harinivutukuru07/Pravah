import { Router } from 'express';
import { productController } from '../controllers/index.js';
import { authenticate } from '../middleware/index.js';

const router = Router();

router.use(authenticate);

// GET /api/products
router.get('/', (req, res, next) => productController.findAll(req, res, next));

// GET /api/products/:id
router.get('/:id', (req, res, next) => productController.findById(req, res, next));

export default router;
