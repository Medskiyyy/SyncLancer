import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

export const createProjectSchema = z.object({
  clientId: z.string().uuid('Invalid Client ID'),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().default(''),
  budget: z.number().min(0, 'Budget must be non-negative'),
  currency: z.string().default('USD'),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  deadline: z.string().or(z.date()).transform((val) => new Date(val)),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
  templateId: z.string().uuid('Invalid Template ID').optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
  description: z.string().optional(),
  budget: z.number().min(0, 'Budget must be non-negative').optional(),
  currency: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  deadline: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  progress: z.number().int().min(0).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
