import { Request, Response, NextFunction } from 'express';
import { enquiryService } from '../services/index.js';

export class EnquiryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await enquiryService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: enquiry });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const enquiries = await enquiryService.findAll();
      res.json({ success: true, data: enquiries });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await enquiryService.findById(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: enquiry });
    } catch (error) {
      next(error);
    }
  }
}

export const enquiryController = new EnquiryController();
