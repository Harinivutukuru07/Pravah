/**
 * Test 2 — Invalid Quotation Conversion
 * Verifies that DRAFT and REJECTED quotations cannot be converted to Sales Orders.
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

describe('Invalid Quotation Conversion', () => {
  it('should reject conversion of DRAFT quotation', async () => {
    // Create a quotation (defaults to DRAFT)
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

    expect(createRes.status).toBe(201);
    const quotationId = createRes.body.data.id;

    // Try to convert DRAFT quotation
    const convertRes = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set('Authorization', `Bearer ${testData.salesToken}`);

    expect(convertRes.status).toBe(400);
    expect(convertRes.body.success).toBe(false);
    expect(convertRes.body.message).toContain('DRAFT');
  });

  it('should reject conversion of REJECTED quotation', async () => {
    // Create a quotation
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

    // Send it
    await request(app)
      .patch(`/api/quotations/${quotationId}/status`)
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ status: 'SENT' });

    // Reject it
    await request(app)
      .patch(`/api/quotations/${quotationId}/status`)
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({ status: 'REJECTED' });

    // Try to convert REJECTED quotation
    const convertRes = await request(app)
      .post(`/api/quotations/${quotationId}/convert`)
      .set('Authorization', `Bearer ${testData.salesToken}`);

    expect(convertRes.status).toBe(400);
    expect(convertRes.body.success).toBe(false);
    expect(convertRes.body.message).toContain('REJECTED');
  });
});
