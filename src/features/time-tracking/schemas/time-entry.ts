import { z } from 'zod';

export const createTimeEntrySchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  taskId: z.string().uuid('Invalid task ID').nullable().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  durationMinutes: z.number().int().min(0, 'Duration must be positive'),
  billable: z.boolean().default(true),
  notes: z.string().default(''),
});

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
