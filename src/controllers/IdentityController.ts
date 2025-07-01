import { Request, Response } from 'express';
import { IdentityService } from '../services/IdentityService';
import { IdentifyRequest } from '../types';

export class IdentityController {
  static async identify(req: Request, res: Response): Promise<void> {
    try {
      const request: IdentifyRequest = req.body;
      
      const result = await IdentityService.identifyContact(request);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in identify endpoint:', error);
      
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }
}
