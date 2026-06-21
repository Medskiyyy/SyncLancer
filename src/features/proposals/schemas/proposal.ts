import { z } from 'zod';

export const proposalItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().default(''),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
});

export const createProposalSchema = z.object({
  clientId: z.string().uuid('Invalid Client ID'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().default(''),
  currency: z.string().default('USD'),
  taxRate: z.number().min(0, 'Tax rate must be non-negative').default(0),
  expiresAt: z.string().or(z.date()).transform((val) => new Date(val)),
  items: z.array(proposalItemSchema).min(1, 'At least one item is required'),
});

export const updateProposalSchema = createProposalSchema.partial().omit({ clientId: true });

export type ProposalItemInput = z.infer<typeof proposalItemSchema>;
export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
