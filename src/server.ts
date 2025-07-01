import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env';
import { securityMiddleware, rateLimitMiddleware } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import identityRoutes from './routes/identityRoutes';

const app = express();

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- ADD THIS DEBUG LOG HERE ---
app.use((req, _res, next) => {
  console.log('SERVER DEBUG: Request path:', req.path);
  console.log('SERVER DEBUG: Request body after express.json():', req.body);
  next();
});

// Security middleware
app.use(securityMiddleware);
app.use(rateLimitMiddleware);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Logging
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));


// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});


app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Welcome to the Identity Reconciliation API! Use the /identify or /health endpoint for operations.',
    documentation: 'Refer to the GitHub README for API usage details.',
    status: 'running'
  });
});

// API routes
app.use('/', identityRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;