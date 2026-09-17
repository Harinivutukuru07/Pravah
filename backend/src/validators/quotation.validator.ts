import { z } from 'zod';

export const createQuotationSchema = z.object({
  enquiryId: z.number().int().positive('Valid enquiry ID is required.'),
  validUntil: z.string().min(1, 'Valid until date is required.'),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('Valid product ID is required.'),
        quantity: z.number().int().positive('Quantity must be greater than 0.'),
        unitPrice: z.number().positive('Unit price must be greater than 0.'),
        discountPercent: z.number().min(0, 'Discount cannot be negative.').max(100, 'Discount cannot exceed 100%.').default(0),
        gstPercent: z.number().min(0, 'GST cannot be negative.').default(18),
      })
    )
    .min(1, 'At least one item is required.'),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['SENT', 'ACCEPTED', 'REJECTED']),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<typeof updateQuotationStatusSchema>;
