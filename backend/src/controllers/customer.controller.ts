import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/index.js';

export class CustomerController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await customerService.findAll();
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.findById(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
