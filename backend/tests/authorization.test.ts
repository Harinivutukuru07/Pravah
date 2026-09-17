/**
 * Test 5 — Unauthorized Operation
 * Verifies that SALES_USER cannot perform ADMIN-only operations.
 */

import request from 'supertest';
import app from '../src/app';
import { setupTestData, cleanupTestData } from './helpers';

let testData: Awaited<ReturnType<typeof setupTestData>>;

beforeAll(async () => {
  testData = await setupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('Authorization / RBAC', () => {
  it('should return 403 when SALES_USER tries to confirm a Sales Order', async () => {
    // Create, accept, and convert a quotation first
    const createRes = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({
        enquiryId: testData.enquiry.id,
        validUntil: '2026-12-31',
        items: [
          {
            productId: testData.product1.id,
            quantity: 5,
            unitPrice: 1000,
            discountPercent: 0,
            gstPercent: 18,
          },
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

    const orderId = convertRes.body.data.id;

    // SALES_USER tries to confirm — should get 403
    const confirmRes = await request(app)
      .post(`/api/sales-orders/${orderId}/confirm`)
      .set('Authorization', `Bearer ${testData.salesToken}`);

    expect(confirmRes.status).toBe(403);
    expect(confirmRes.body.success).toBe(false);
    expect(confirmRes.body.message).toContain('permission');
  });

  it('should return 403 when SALES_USER tries to dispatch', async () => {
    const res = await request(app)
      .post('/api/sales-orders/999/dispatch')
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ vehicleNumber: 'KA-01-1234', driverName: 'Test' });

    expect(res.status).toBe(403);
  });

  it('should return 403 when SALES_USER tries to manage inventory', async () => {
    const res = await request(app)
      .patch(`/api/inventory/${testData.product1.id}`)
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ physicalQuantity: 999 });

    expect(res.status).toBe(403);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/enquiries');
    expect(res.status).toBe(401);
  });
});
