import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const identifySchema = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().pattern(/^\d+$/).optional().allow(null),
}).or('email', 'phoneNumber');

export const validateIdentifyRequest = (req: Request, res: Response, next: NextFunction) => {
    // --- ADD THIS DEBUG LOG HERE ---
    console.log('VALIDATOR DEBUG: Received body in validator:', req.body);
    // --- END DEBUG LOG ---  
  const { error } = identifySchema.validate(req.body, {
    abortEarly: false,
    convert: true,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => ({
        path: detail.path ? detail.path.join('.') : detail.context?.key || 'unknown',
        message: detail.message
      }))
    });
  }
  // This check is technically redundant if Joi.or() works, but good for clarity/fallback
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: 'At least one of email or phoneNumber must be provided'
    });
  }
  return next();
};