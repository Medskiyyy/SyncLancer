import { z } from 'zod';
import { Frequency } from '@prisma/client';

export const createRecurringInvoiceSchema = z.object({
  clientId: z.string().uuid('Invalid client ID'),
  frequency: z.nativeEnum(Frequency),
  nextRunAt: z.coerce.date(),
  active: z.boolean().default(true),
});

export const updateRecurringInvoiceSchema = createRecurringInvoiceSchema.partial();

export type CreateRecurringInvoiceInput = z.infer<typeof createRecurringInvoiceSchema>;
export type UpdateRecurringInvoiceInput = z.infer<typeof updateRecurringInvoiceSchema>;
