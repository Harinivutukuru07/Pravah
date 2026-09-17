import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/**
 * Generates a valid JWT token for testing purposes.
 */
export function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Sets up a clean test database with seed data.
 * Returns the created entities for use in tests.
 */
export async function setupTestData() {
  // Clean up in reverse dependency order
  await prisma.dispatch.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.enquiryItem.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'testadmin@pravah.com',
      password: hashedPassword,
      name: 'Test Admin',
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.create({
    data: {
      email: 'testsales@pravah.com',
      password: hashedPassword,
      name: 'Test Sales',
      role: Role.SALES_USER,
    },
  });

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      companyName: 'Test Corp',
      contactPerson: 'John Doe',
      mobile: '9999999999',
      email: 'john@testcorp.com',
      city: 'Mumbai',
    },
  });

  // Create products
  const product1 = await prisma.product.create({
    data: {
      productCode: 'TEST-001',
      productName: 'Test Steel Pipe',
      category: 'Steel',
      unit: 'PCS',
      basePrice: 1000.0,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      productCode: 'TEST-002',
      productName: 'Test Copper Wire',
      category: 'Electrical',
      unit: 'ROLL',
      basePrice: 5000.0,
    },
  });

  // Create inventory
  const inventory1 = await prisma.inventory.create({
    data: { productId: product1.id, physicalQuantity: 100, reservedQuantity: 0 },
  });

  const inventory2 = await prisma.inventory.create({
    data: { productId: product2.id, physicalQuantity: 50, reservedQuantity: 0 },
  });

  // Create enquiry
  const enquiry = await prisma.enquiry.create({
    data: {
      enquiryNumber: 'TEST-ENQ-001',
      customerId: customer.id,
      userId: salesUser.id,
      enquiryDate: new Date(),
      status: 'NEW',
      items: {
        create: [
          { productId: product1.id, quantity: 10 },
          { productId: product2.id, quantity: 5 },
        ],
      },
    },
    include: { items: true },
  });

  return {
    admin,
    salesUser,
    customer,
    product1,
    product2,
    inventory1,
    inventory2,
    enquiry,
    adminToken: generateToken(admin),
    salesToken: generateToken(salesUser),
  };
}

export async function cleanupTestData() {
  await prisma.dispatch.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.enquiryItem.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
}

export { prisma };
