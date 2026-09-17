import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';

export class InventoryService {
  async findAll() {
    const inventory = await prisma.inventory.findMany({
      include: { product: true },
      orderBy: { product: { productName: 'asc' } },
    });

    return inventory.map((inv) => ({
      ...inv,
      availableQuantity: inv.physicalQuantity - inv.reservedQuantity,
    }));
  }

  async findByProductId(productId: number) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!inventory) {
      throw new AppError('Inventory not found for this product.', 404);
    }

    return {
      ...inventory,
      availableQuantity: inventory.physicalQuantity - inventory.reservedQuantity,
    };
  }

  async updatePhysicalQuantity(productId: number, physicalQuantity: number) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new AppError('Inventory not found for this product.', 404);
    }

    if (physicalQuantity < inventory.reservedQuantity) {
      throw new AppError(
        `Physical quantity cannot be less than reserved quantity (${inventory.reservedQuantity}).`,
        400
      );
    }

    const updated = await prisma.inventory.update({
      where: { productId },
      data: { physicalQuantity },
      include: { product: true },
    });

    return {
      ...updated,
      availableQuantity: updated.physicalQuantity - updated.reservedQuantity,
    };
  }
}

export const inventoryService = new InventoryService();
