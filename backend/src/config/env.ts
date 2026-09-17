import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
