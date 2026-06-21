import { z } from 'zod';
import { LeadStatus } from '@prisma/client';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  notes: z.string(),
});

export const updateLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  company: z.string().min(1, 'Company name is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
