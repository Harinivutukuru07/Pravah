import { Prisma } from '@prisma/client';
import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';

export class SalesOrderService {
  async findAll() {
    return prisma.salesOrder.findMany({
      include: {
        customer: true,
        quotation: { select: { id: true, quotationNumber: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        dispatch: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: {
          include: {
            enquiry: { select: { id: true, enquiryNumber: true } },
            items: { include: { product: true } },
          },
        },
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        dispatch: true,
      },
    });

    if (!order) {
      throw new AppError('Sales Order not found.', 404);
    }

    return order;
  }

  /**
   * Confirm a Sales Order and reserve inventory.
   * Uses PostgreSQL transaction with row-level locking (SELECT ... FOR UPDATE)
   * to prevent concurrent over-reservation.
   */
  async confirmOrder(id: number) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new AppError('Sales Order not found.', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError(
        `Cannot confirm order with status ${order.status}. Only PENDING orders can be confirmed.`,
        400
      );
    }

    // Use interactive transaction with inventory reservation
    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // Lock and validate inventory rows for all products in this order
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (!inventory) {
          throw new AppError(
            `Inventory not found for product: ${item.product.productName}.`,
            404
          );
        }

        const available = inventory.physicalQuantity - inventory.reservedQuantity;

        if (available < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${item.product.productName}. Available: ${available}, Requested: ${item.quantity}.`,
            400
          );
        }

        // Update reserved quantity
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: { increment: item.quantity },
          },
        });
      }

      // Update order status to CONFIRMED
      const confirmed = await tx.salesOrder.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: true,
          quotation: { select: { id: true, quotationNumber: true } },
          items: { include: { product: true } },
        },
      });

      return confirmed;
    });

    return confirmedOrder;
  }

  /**
   * Dispatch a confirmed Sales Order.
   * Decreases physical and reserved quantities in a transaction.
   */
  async dispatchOrder(id: number, vehicleNumber: string, driverName: string) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        dispatch: true,
      },
    });

    if (!order) {
      throw new AppError('Sales Order not found.', 404);
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('Cannot dispatch a cancelled order.', 400);
    }

    if (order.status !== 'CONFIRMED') {
      throw new AppError(
        `Cannot dispatch order with status ${order.status}. Only CONFIRMED orders can be dispatched.`,
        400
      );
    }

    if (order.dispatch) {
      throw new AppError(
        `This order has already been dispatched (${order.dispatch.dispatchNumber}).`,
        409
      );
    }

    // Generate dispatch number
    const count = await prisma.dispatch.count();
    const dispatchNumber = `DSP-${(count + 1).toString().padStart(4, '0')}`;

    // Process dispatch in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Validate and update inventory for each item
      for (const item of order.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        if (!inventory) {
          throw new AppError(
            `Inventory not found for product: ${item.product.productName}.`,
            404
          );
        }

        if (inventory.reservedQuantity < item.quantity) {
          throw new AppError(
            `Cannot dispatch ${item.quantity} of ${item.product.productName}. Only ${inventory.reservedQuantity} reserved.`,
            400
          );
        }

        // Decrease both physical and reserved quantities
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            physicalQuantity: { decrement: item.quantity },
            reservedQuantity: { decrement: item.quantity },
          },
        });
      }

      // Create dispatch record
      const dispatch = await tx.dispatch.create({
        data: {
          dispatchNumber,
          salesOrderId: id,
          dispatchDate: new Date(),
          vehicleNumber,
          driverName,
        },
      });

      // Update order status
      const updatedOrder = await tx.salesOrder.update({
        where: { id },
        data: { status: 'DISPATCHED' },
        include: {
          customer: true,
          quotation: { select: { id: true, quotationNumber: true } },
          items: { include: { product: true } },
          dispatch: true,
        },
      });

      return updatedOrder;
    });

    return result;
  }

  /**
   * Cancel a Sales Order.
   * If CONFIRMED, releases reserved inventory.
   */
  async cancelOrder(id: number) {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true, dispatch: true },
    });

    if (!order) {
      throw new AppError('Sales Order not found.', 404);
    }

    if (order.status === 'DISPATCHED') {
      throw new AppError('Cannot cancel a dispatched order.', 400);
    }

    if (order.status === 'CANCELLED') {
      throw new AppError('Order is already cancelled.', 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      // If order was CONFIRMED, release reserved stock
      if (order.status === 'CONFIRMED') {
        for (const item of order.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          customer: true,
          items: { include: { product: true } },
        },
      });
    });

    return result;
  }
}

export const salesOrderService = new SalesOrderService();
