import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
};