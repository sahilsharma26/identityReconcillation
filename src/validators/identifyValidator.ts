import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const identifySchema = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().pattern(/^\d+$/).optional().allow(null),
}).or('email', 'phoneNumber');

export const validateIdentifyRequest = (req: Request, res: Response, next: NextFunction) => {
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
  return next();
};