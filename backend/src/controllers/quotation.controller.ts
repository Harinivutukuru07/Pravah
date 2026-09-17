import { Request, Response, NextFunction } from 'express';
import { quotationService } from '../services/index.js';

export class QuotationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.create(req.body, req.user!.userId);
      res.status(201).json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await quotationService.findAll();
      res.json({ success: true, data: quotations });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.findById(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await quotationService.updateStatus(
        parseInt(String(req.params.id), 10),
        req.body.status
      );
      res.json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  async convertToSalesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const salesOrder = await quotationService.convertToSalesOrder(
        parseInt(String(req.params.id), 10),
        req.user!.userId
      );
      res.status(201).json({ success: true, data: salesOrder });
    } catch (error) {
      next(error);
    }
  }
}

export const quotationController = new QuotationController();
