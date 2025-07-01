// src/config/env.ts
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
console.log('ENV CONFIG DEBUG: NODE_ENV:', process.env.NODE_ENV);
console.log('ENV CONFIG DEBUG: DATABASE_URL:', process.env.DATABASE_URL ? '***** (present)' : 'NOT PRESENT');
console.log('ENV CONFIG DEBUG: PORT:', process.env.PORT);
console.log('ENV CONFIG DEBUG: ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);


export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string, 
  allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

if (!config.databaseUrl) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is not set. Application cannot start.');
  process.exit(1); 
}