import { z } from 'zod';

export const createEnquirySchema = z.object({
  customerId: z.number().int().positive('Valid customer ID is required.'),
  enquiryDate: z.string().min(1, 'Enquiry date is required.'),
  requiredDate: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive('Valid product ID is required.'),
        quantity: z.number().int().positive('Quantity must be greater than 0.'),
      })
    )
    .min(1, 'At least one item is required.'),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
