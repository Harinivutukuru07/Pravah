import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';
import { CreateEnquiryInput } from '../validators/enquiry.validator.js';

export class EnquiryService {
  private async generateEnquiryNumber(): Promise<string> {
    const count = await prisma.enquiry.count();
    const num = (count + 1).toString().padStart(4, '0');
    return `ENQ-${num}`;
  }

  async create(data: CreateEnquiryInput, userId: number) {
    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new AppError('Customer not found.', 404);
    }

    // Validate all products exist
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found.', 404);
    }

    // Generate enquiry number
    const enquiryNumber = await this.generateEnquiryNumber();

    // Create enquiry with items in a transaction
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerId: data.customerId,
        userId,
        enquiryDate: new Date(data.enquiryDate),
        requiredDate: data.requiredDate ? new Date(data.requiredDate) : null,
        notes: data.notes || null,
        status: 'NEW',
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
      },
    });

    return enquiry;
  }

  async findAll() {
    return prisma.enquiry.findMany({
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        quotations: { select: { id: true, quotationNumber: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: { include: { product: true } },
        quotations: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!enquiry) {
      throw new AppError('Enquiry not found.', 404);
    }

    return enquiry;
  }
}

export const enquiryService = new EnquiryService();
