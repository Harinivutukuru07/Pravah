import { z } from 'zod';

export const updateInventorySchema = z.object({
  physicalQuantity: z.number().int().min(0, 'Physical quantity cannot be negative.'),
});

export const dispatchOrderSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number is required.'),
  driverName: z.string().min(1, 'Driver name is required.'),
});

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type DispatchOrderInput = z.infer<typeof dispatchOrderSchema>;
