import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const identifySchema = Joi.object({
  email: Joi.string().email().optional().allow(null),
  phoneNumber: Joi.string().pattern(/^\d+$/).optional().allow(null),
}).or('email', 'phoneNumber');

export const validateIdentifyRequest = (req: Request, res: Response, next: NextFunction) => {
  const { error } = identifySchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Invalid request format',
      details: error.details.map(detail => detail.message)
    });
  }

  // Ensure at least one field is provided and not null
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: 'At least one of email or phoneNumber must be provided'
    });
  }

  next();
};