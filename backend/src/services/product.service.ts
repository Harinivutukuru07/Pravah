import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';

export class ProductService {
  async findAll() {
    return prisma.product.findMany({
      include: { inventory: true },
      orderBy: { productName: 'asc' },
    });
  }

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { inventory: true },
    });
    if (!product) {
      throw new AppError('Product not found.', 404);
    }
    return product;
  }
}

export const productService = new ProductService();
