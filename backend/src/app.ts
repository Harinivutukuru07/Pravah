import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/index.js';
import { errorHandler } from './middleware/index.js';
import {
  authRoutes,
  customerRoutes,
  enquiryRoutes,
  productRoutes,
  inventoryRoutes,
  quotationRoutes,
  salesOrderRoutes,
} from './routes/index.js';

const app = express();

// =============================================
// Global Middleware
// =============================================
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

// =============================================
// Health Check
// =============================================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'PRAVAH API is running.',
    timestamp: new Date().toISOString(),
  });
});

// =============================================
// API Routes
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/sales-orders', salesOrderRoutes);

// =============================================
// 404 Handler
// =============================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// =============================================
// Global Error Handler
// =============================================
app.use(errorHandler);

export default app;
