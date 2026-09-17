import { QuotationStatus, EnquiryStatus } from '@prisma/client';
import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';
import { CreateQuotationInput } from '../validators/quotation.validator.js';

export class QuotationService {
  private async generateQuotationNumber(): Promise<string> {
    const count = await prisma.quotation.count();
    const num = (count + 1).toString().padStart(4, '0');
    return `QTN-${num}`;
  }

  /**
   * Calculates line amount for a quotation item.
   * Formula: (Quantity × Unit Price) × (1 - Discount/100) × (1 + GST/100)
   */
  private calculateLineAmount(
    quantity: number,
    unitPrice: number,
    discountPercent: number,
    gstPercent: number
  ): number {
    const baseAmount = quantity * unitPrice;
    const afterDiscount = baseAmount * (1 - discountPercent / 100);
    const afterGst = afterDiscount * (1 + gstPercent / 100);
    return Math.round(afterGst * 100) / 100;
  }

  async create(data: CreateQuotationInput, userId: number) {
    // Validate enquiry exists and is in valid state
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: data.enquiryId },
      include: { customer: true },
    });

    if (!enquiry) {
      throw new AppError('Enquiry not found.', 404);
    }

    // Validate products exist
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found.', 404);
    }

    // Generate quotation number
    const quotationNumber = await this.generateQuotationNumber();

    // Calculate line amounts on the backend (do NOT trust frontend amounts)
    const calculatedItems = data.items.map((item) => {
      const lineAmount = this.calculateLineAmount(
        item.quantity,
        item.unitPrice,
        item.discountPercent ?? 0,
        item.gstPercent ?? 18
      );
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent ?? 0,
        gstPercent: item.gstPercent ?? 18,
        lineAmount,
      };
    });

    // Calculate grand total
    const grandTotal = calculatedItems.reduce((sum, item) => sum + item.lineAmount, 0);

    // Create quotation with items
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        enquiryId: data.enquiryId,
        customerId: enquiry.customerId,
        userId,
        validUntil: new Date(data.validUntil),
        grandTotal: Math.round(grandTotal * 100) / 100,
        status: 'DRAFT',
        items: {
          create: calculatedItems,
        },
      },
      include: {
        customer: true,
        enquiry: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
      },
    });

    // Update enquiry status to QUOTED
    await prisma.enquiry.update({
      where: { id: data.enquiryId },
      data: { status: EnquiryStatus.QUOTED },
    });

    return quotation;
  }

  async findAll() {
    return prisma.quotation.findMany({
      include: {
        customer: true,
        enquiry: { select: { id: true, enquiryNumber: true, status: true } },
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        salesOrder: { select: { id: true, orderNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        enquiry: { include: { items: { include: { product: true } } } },
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        salesOrder: {
          include: {
            items: { include: { product: true } },
            dispatch: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found.', 404);
    }

    return quotation;
  }

  async updateStatus(id: number, newStatus: string) {
    const quotation = await prisma.quotation.findUnique({ where: { id } });

    if (!quotation) {
      throw new AppError('Quotation not found.', 404);
    }

    // Enforce status transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['SENT'],
      SENT: ['ACCEPTED', 'REJECTED'],
    };

    const allowed = validTransitions[quotation.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${quotation.status} to ${newStatus}.`,
        400
      );
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: newStatus as QuotationStatus },
      include: {
        customer: true,
        enquiry: true,
        items: { include: { product: true } },
      },
    });

    return updated;
  }

  async convertToSalesOrder(id: number, userId: number) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        items: true,
        salesOrder: true,
      },
    });

    if (!quotation) {
      throw new AppError('Quotation not found.', 404);
    }

    // Only ACCEPTED quotations can be converted
    if (quotation.status !== 'ACCEPTED') {
      throw new AppError(
        `Cannot create Sales Order from a ${quotation.status} quotation. Only ACCEPTED quotations can be converted.`,
        400
      );
    }

    // Check for existing sales order (prevent duplicate)
    if (quotation.salesOrder) {
      throw new AppError(
        `A Sales Order (${quotation.salesOrder.orderNumber}) already exists for this quotation.`,
        409
      );
    }

    // Generate order number
    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${(count + 1).toString().padStart(4, '0')}`;

    // Create Sales Order with items in a transaction
    const salesOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          quotationId: quotation.id,
          customerId: quotation.customerId,
          userId,
          orderDate: new Date(),
          totalAmount: quotation.grandTotal,
          status: 'PENDING',
          items: {
            create: quotation.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineAmount: item.lineAmount,
            })),
          },
        },
        include: {
          customer: true,
          quotation: { select: { id: true, quotationNumber: true } },
          items: { include: { product: true } },
        },
      });

      // Update enquiry status to WON
      await tx.enquiry.update({
        where: { id: quotation.enquiryId },
        data: { status: EnquiryStatus.WON },
      });

      return order;
    });

    return salesOrder;
  }
}

export const quotationService = new QuotationService();
