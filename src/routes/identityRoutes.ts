import { Router } from 'express';
import { IdentityController } from '../controllers/IdentityController';
import { validateIdentifyRequest } from '../validators/identifyValidator';

const router = Router();

router.post('/identify', validateIdentifyRequest, IdentityController.identify);

export default router;

// src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});