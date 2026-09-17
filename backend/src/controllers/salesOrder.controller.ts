import { Request, Response, NextFunction } from 'express';
import { salesOrderService } from '../services/index.js';

export class SalesOrderController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await salesOrderService.findAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await salesOrderService.findById(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await salesOrderService.confirmOrder(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async dispatch(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await salesOrderService.dispatchOrder(
        parseInt(String(req.params.id), 10),
        req.body.vehicleNumber,
        req.body.driverName
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await salesOrderService.cancelOrder(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}

export const salesOrderController = new SalesOrderController();
