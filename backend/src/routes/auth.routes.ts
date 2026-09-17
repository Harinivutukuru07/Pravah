import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, validate } from '../middleware/index.js';
import { loginSchema } from '../validators/index.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

// GET /api/auth/me
router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
