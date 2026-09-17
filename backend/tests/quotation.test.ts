/**
 * Test 1 — Quotation Calculation
 * Verifies that the backend correctly calculates line amounts and grand total.
 * Formula: (Quantity × Unit Price) × (1 - Discount/100) × (1 + GST/100)
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

describe('Quotation Calculation', () => {
  it('should correctly calculate line amounts and grand total', async () => {
    const res = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({
        enquiryId: testData.enquiry.id,
        validUntil: '2026-12-31',
        items: [
          {
            productId: testData.product1.id,
            quantity: 10,
            unitPrice: 1000,
            discountPercent: 10,
            gstPercent: 18,
          },
          {
            productId: testData.product2.id,
            quantity: 5,
            unitPrice: 5000,
            discountPercent: 5,
            gstPercent: 18,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const quotation = res.body.data;

    // Item 1: 10 × 1000 = 10000, after 10% discount = 9000, after 18% GST = 10620
    expect(quotation.items[0].lineAmount).toBeCloseTo(10620, 1);

    // Item 2: 5 × 5000 = 25000, after 5% discount = 23750, after 18% GST = 28025
    expect(quotation.items[1].lineAmount).toBeCloseTo(28025, 1);

    // Grand total: 10620 + 28025 = 38645
    expect(quotation.grandTotal).toBeCloseTo(38645, 1);
  });

  it('should not trust frontend-submitted amounts', async () => {
    // Even if frontend sends wrong amounts, backend should calculate correctly
    const res = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${testData.salesToken}`)
      .send({
        enquiryId: testData.enquiry.id,
        validUntil: '2026-12-31',
        items: [
          {
            productId: testData.product1.id,
            quantity: 1,
            unitPrice: 100,
            discountPercent: 0,
            gstPercent: 18,
          },
        ],
      });

    expect(res.status).toBe(201);
    // 1 × 100 × 1.18 = 118
    expect(res.body.data.items[0].lineAmount).toBeCloseTo(118, 1);
    expect(res.body.data.grandTotal).toBeCloseTo(118, 1);
  });
});
