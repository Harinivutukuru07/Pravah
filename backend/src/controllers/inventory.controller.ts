import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/index.js';

export class InventoryController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.findAll();
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async findByProductId(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.findByProductId(
        parseInt(String(req.params.productId), 10)
      );
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async updatePhysicalQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.updatePhysicalQuantity(
        parseInt(String(req.params.productId), 10),
        req.body.physicalQuantity
      );
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
