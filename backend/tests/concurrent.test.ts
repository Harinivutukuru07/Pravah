/**
 * Bonus Test — Concurrent Reservation
 * Verifies that simultaneous reservation requests cannot overbook inventory.
 */

import request from 'supertest';
import app from '../src/app';
import { setupTestData, cleanupTestData, prisma } from './helpers';

let testData: Awaited<ReturnType<typeof setupTestData>>;

beforeAll(async () => {
  testData = await setupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('Concurrent Reservation', () => {
  it('should prevent over-reservation with simultaneous requests', async () => {
    // Set inventory: physical=100, reserved=0 → available=100
    await prisma.inventory.update({
      where: { productId: testData.product1.id },
      data: { physicalQuantity: 100, reservedQuantity: 0 },
    });

    // Create TWO accepted quotations, each requesting 80 units
    const orderIds: number[] = [];

    for (let i = 0; i < 2; i++) {
      // Create a new enquiry for each
      const enquiry = await prisma.enquiry.create({
        data: {
          enquiryNumber: `CONC-ENQ-${i}`,
          customerId: testData.customer.id,
          userId: testData.salesUser.id,
          enquiryDate: new Date(),
          status: 'NEW',
          items: { create: [{ productId: testData.product1.id, quantity: 80 }] },
        },
      });

      const createRes = await request(app)
        .post('/api/quotations')
        .set('Authorization', `Bearer ${testData.salesToken}`)
        .send({
          enquiryId: enquiry.id,
          validUntil: '2026-12-31',
          items: [
            { productId: testData.product1.id, quantity: 80, unitPrice: 1000, discountPercent: 0, gstPercent: 18 },
          ],
        });

      const quotationId = createRes.body.data.id;

      await request(app)
        .patch(`/api/quotations/${quotationId}/status`)
        .set('Authorization', `Bearer ${testData.salesToken}`)
        .send({ status: 'SENT' });

      await request(app)
        .patch(`/api/quotations/${quotationId}/status`)
        .set('Authorization', `Bearer ${testData.salesToken}`)
        .send({ status: 'ACCEPTED' });

      const convertRes = await request(app)
        .post(`/api/quotations/${quotationId}/convert`)
        .set('Authorization', `Bearer ${testData.salesToken}`);

      orderIds.push(convertRes.body.data.id);
    }

    // Send BOTH confirmation requests simultaneously
    const results = await Promise.all(
      orderIds.map((id) =>
        request(app)
          .post(`/api/sales-orders/${id}/confirm`)
          .set('Authorization', `Bearer ${testData.adminToken}`)
      )
    );

    // One should succeed (200), one should fail (400)
    const statuses = results.map((r) => r.status).sort();
    expect(statuses).toContain(200);
    expect(statuses).toContain(400);

    // Verify total reserved never exceeds available (100)
    const inventory = await prisma.inventory.findUnique({
      where: { productId: testData.product1.id },
    });
    expect(inventory!.reservedQuantity).toBeLessThanOrEqual(100);
    expect(inventory!.reservedQuantity).toBe(80); // Only one should have reserved
  });
});
