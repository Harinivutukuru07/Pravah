import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/index.js';

export class ProductController {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.findAll();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById(parseInt(String(req.params.id), 10));
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
