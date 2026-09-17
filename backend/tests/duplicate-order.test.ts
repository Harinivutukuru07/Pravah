/**
 * Test 3 — Duplicate Sales Order Prevention
 * Verifies that the same quotation cannot create multiple Sales Orders.
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

describe('Duplicate Sales Order Prevention', () => {
  it('should prevent creating duplicate Sales Order from same quotation', async () => {
    // Create and accept a quotation
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

    // Send → Accept
    await request(app)
      .patch(`/api/quotations/${quotationId}/status`)
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ status: 'SENT' });

    await request(app)
      .patch(`/api/quotations/${quotationId}/status`)
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ status: 'ACCEPTED' });

    // First conversion — should succeed
    const firstConvert = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set('Authorization', `Bearer ${testData.salesToken}`);

    expect(firstConvert.status).toBe(201);
    expect(firstConvert.body.success).toBe(true);

    // Second conversion — should be rejected
    const secondConvert = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set('Authorization', `Bearer ${testData.salesToken}`);

    expect(secondConvert.status).toBe(409);
    expect(secondConvert.body.success).toBe(false);
    expect(secondConvert.body.message).toContain('already exists');
  });
});
