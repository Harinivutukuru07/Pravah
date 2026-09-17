import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PRAVAH database...\n');

  // =============================================
  // 1. Create Users
  // =============================================
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pravah.com' },
    update: {},
    create: {
      email: 'admin@pravah.com',
      password: hashedPassword,
      name: 'Rajesh Kumar',
      role: Role.ADMIN,
    },
  });

  const salesUser = await prisma.user.upsert({
    where: { email: 'sales@pravah.com' },
    update: {},
    create: {
      email: 'sales@pravah.com',
      password: hashedPassword,
      name: 'Priya Sharma',
      role: Role.SALES_USER,
    },
  });

  console.log('✅ Users created:', admin.email, salesUser.email);

  // =============================================
  // 2. Create Customers
  // =============================================
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        companyName: 'Tata Steel Industries',
        contactPerson: 'Amit Patel',
        mobile: '9876543210',
        email: 'amit@tatasteel.com',
        city: 'Mumbai',
      },
    }),
    prisma.customer.create({
      data: {
        companyName: 'Larsen & Toubro Engineering',
        contactPerson: 'Sunita Reddy',
        mobile: '9876543211',
        email: 'sunita@lnt.com',
        city: 'Chennai',
      },
    }),
    prisma.customer.create({
      data: {
        companyName: 'Bharat Heavy Electricals',
        contactPerson: 'Vikram Singh',
        mobile: '9876543212',
        email: 'vikram@bhel.com',
        city: 'New Delhi',
      },
    }),
    prisma.customer.create({
      data: {
        companyName: 'Mahindra Manufacturing',
        contactPerson: 'Deepa Nair',
        mobile: '9876543213',
        email: 'deepa@mahindra.com',
        city: 'Pune',
      },
    }),
    prisma.customer.create({
      data: {
        companyName: 'Godrej Industrial Solutions',
        contactPerson: 'Rahul Desai',
        mobile: '9876543214',
        email: 'rahul@godrej.com',
        city: 'Hyderabad',
      },
    }),
  ]);

  console.log('✅ Customers created:', customers.length);

  // =============================================
  // 3. Create Products (6 Industrial Products)
  // =============================================
  const products = await Promise.all([
    prisma.product.create({
      data: {
        productCode: 'STL-PIPE-001',
        productName: 'Stainless Steel Pipe (6m)',
        category: 'Steel',
        unit: 'PCS',
        basePrice: 2500.0,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'COP-WIRE-002',
        productName: 'Copper Wire Cable (100m roll)',
        category: 'Electrical',
        unit: 'ROLL',
        basePrice: 8500.0,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'BRG-BALL-003',
        productName: 'Industrial Ball Bearing (6205)',
        category: 'Bearings',
        unit: 'PCS',
        basePrice: 450.0,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'HYD-PUMP-004',
        productName: 'Hydraulic Gear Pump (10HP)',
        category: 'Hydraulics',
        unit: 'PCS',
        basePrice: 35000.0,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'IND-VALVE-005',
        productName: 'Industrial Gate Valve (DN100)',
        category: 'Valves',
        unit: 'PCS',
        basePrice: 4200.0,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'ELC-MOTOR-006',
        productName: 'AC Electric Motor (5HP)',
        category: 'Motors',
        unit: 'PCS',
        basePrice: 18500.0,
      },
    }),
  ]);

  console.log('✅ Products created:', products.length);

  // =============================================
  // 4. Create Inventory for all products
  // =============================================
  const inventoryData = [
    { productId: products[0].id, physicalQuantity: 200, reservedQuantity: 0 },
    { productId: products[1].id, physicalQuantity: 150, reservedQuantity: 0 },
    { productId: products[2].id, physicalQuantity: 500, reservedQuantity: 0 },
    { productId: products[3].id, physicalQuantity: 100, reservedQuantity: 0 },
    { productId: products[4].id, physicalQuantity: 300, reservedQuantity: 0 },
    { productId: products[5].id, physicalQuantity: 120, reservedQuantity: 0 },
  ];

  const inventory = await Promise.all(
    inventoryData.map((data) => prisma.inventory.create({ data }))
  );

  console.log('✅ Inventory created:', inventory.length);

  console.log('\n🎉 Seeding complete!\n');
  console.log('📋 Test Credentials:');
  console.log('   Admin:      admin@pravah.com / password123');
  console.log('   Sales User: sales@pravah.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
