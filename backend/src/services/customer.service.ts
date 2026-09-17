import { prisma } from '../config/index.js';
import { AppError } from '../middleware/index.js';
import { CreateCustomerInput } from '../validators/customer.validator.js';

export class CustomerService {
  async create(data: CreateCustomerInput) {
    const customer = await prisma.customer.create({ data });
    return customer;
  }

  async findAll() {
    return prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new AppError('Customer not found.', 404);
    }
    return customer;
  }
}

export const customerService = new CustomerService();
