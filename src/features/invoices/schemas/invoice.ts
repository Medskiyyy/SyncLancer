import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const invoiceItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().default(''),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
});

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  projectId: z.string().uuid('Invalid project ID').optional().nullable(),
  dueDate: z.coerce.date(),
  currency: z.string().default('USD'),
  taxRate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100').default(0),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: z.nativeEnum(InvoiceStatus).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
