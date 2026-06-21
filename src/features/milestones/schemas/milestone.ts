import { z } from 'zod';
import { MilestoneStatus } from '@prisma/client';

export const createMilestoneSchema = z.object({
  projectId: z.string().uuid('Invalid Project ID'),
  title: z.string().min(2, 'Milestone title must be at least 2 characters'),
  description: z.string().default(''),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
  status: z.nativeEnum(MilestoneStatus).default(MilestoneStatus.NOT_STARTED),
  sortOrder: z.number().int().default(0),
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(2, 'Milestone title must be at least 2 characters').optional(),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  status: z.nativeEnum(MilestoneStatus).optional(),
  sortOrder: z.number().int().optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
