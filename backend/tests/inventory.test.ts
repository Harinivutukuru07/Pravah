/**
 * Test 4 — Insufficient Inventory
 * Verifies that inventory reservation is rejected when requested > available.
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

describe('Insufficient Inventory', () => {
  it('should reject reservation when requested quantity exceeds available stock', async () => {
    // Set inventory to a known quantity: physical=20, reserved=0
    await prisma.inventory.update({
      where: { productId: testData.product1.id },
      data: { physicalQuantity: 20, reservedQuantity: 0 },
    });

    // Create a quotation requesting 50 (more than available 20)
    const createRes = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({
        enquiryId: testData.enquiry.id,
        validUntil: '2026-12-31',
        items: [
          {
            productId: testData.product1.id,
            quantity: 50,
            unitPrice: 1000,
            discountPercent: 0,
            gstPercent: 18,
          },
        ],
      });

    const quotationId = createRes.body.data.id;

    // Send → Accept → Convert
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

    const orderId = convertRes.body.data.id;

    // Admin tries to confirm — should fail due to insufficient stock
    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${testData.adminToken}`);

    expect(confirmRes.status).toBe(400);
    expect(confirmRes.body.success).toBe(false);
    expect(confirmRes.body.message).toContain('Insufficient');

    // Verify inventory was NOT changed (rolled back)
    const inventory = await prisma.inventory.findUnique({
      where: { productId: testData.product1.id },
    });
    expect(inventory!.reservedQuantity).toBe(0);
  });
});
