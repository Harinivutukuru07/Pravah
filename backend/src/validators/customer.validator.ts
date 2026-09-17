import { z } from 'zod';

export const createCustomerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  contactPerson: z.string().min(1, 'Contact person is required.'),
  mobile: z.string().min(10, 'Valid mobile number is required.'),
  email: z.string().email('Valid email is required.'),
  city: z.string().min(1, 'City is required.'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
