import { z } from 'zod';

export const createClientSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  primaryEmail: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  notes: z.string(),
});

export const updateClientSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  primaryEmail: z.string().email('Invalid email address').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  notes: z.string().optional(),
  archived: z.boolean().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
