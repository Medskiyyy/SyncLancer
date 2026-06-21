import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

export const createTaskSchema = z.object({
  projectId: z.string().uuid('Invalid Project ID'),
  milestoneId: z.string().uuid('Invalid Milestone ID').optional().nullable(),
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().default(''),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.BACKLOG),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)),
});

export const updateTaskSchema = z.object({
  milestoneId: z.string().uuid('Invalid Milestone ID').optional().nullable(),
  title: z.string().min(2, 'Task title must be at least 2 characters').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
