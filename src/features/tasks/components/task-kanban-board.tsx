'use client';

import { getErrorMessage } from '@/lib/errors';

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority, Milestone } from '@prisma/client';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  closestCorners,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  GripVertical,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { createTaskSchema, updateTaskSchema, type CreateTaskInput, type UpdateTaskInput } from '@/features/tasks/schemas/task';
import {
  createTaskAction,
  updateTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
} from '@/features/tasks/actions/task-actions';

// Types
interface ExtendedTask extends Task {
  milestone?: Milestone | null;
}

interface TaskKanbanBoardProps {
  initialTasks: ExtendedTask[];
  milestones: Milestone[];
  projectId: string;
  workspaceId: string;
  workspaceSlug: string;
}

interface TaskFormValues {
  projectId?: string;
  milestoneId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | string;
}

const COLUMNS: { label: string; status: TaskStatus; dot?: string }[] = [
  { label: 'Backlog', status: TaskStatus.BACKLOG },
  { label: 'To Do', status: TaskStatus.TODO },
  { label: 'In Progress', status: TaskStatus.IN_PROGRESS },
  { label: 'Review', status: TaskStatus.REVIEW },
  { label: 'Done', status: TaskStatus.DONE, dot: 'bg-brand' },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'border-border bg-secondary text-muted-foreground',
  MEDIUM: 'border-border bg-background text-foreground',
  HIGH: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  URGENT: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
};

function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-colors duration-150 ${isOver ? 'border-foreground/40 bg-secondary' : ''}`}
    >
      {children}
    </div>
  );
}

function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: ExtendedTask;
  onEdit: (task: ExtendedTask) => void;
  onDelete: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30 ${
        isDragging ? 'opacity-50 shadow-lg z-50' : ''
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <h4 className="truncate text-sm font-semibold text-foreground">{task.title}</h4>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="line-clamp-2 pl-6 text-xs text-muted-foreground">{task.description}</p>
        )}

        <div className="flex items-center justify-between pl-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`px-1.5 text-[11px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </Badge>
            {task.milestone && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Layers className="h-3 w-3" />
                {task.milestone.title}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export function TaskKanbanBoard({ initialTasks, milestones, projectId, workspaceId }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks);
  const [syncedTasks, setSyncedTasks] = useState(initialTasks);
  if (initialTasks !== syncedTasks) {
    setSyncedTasks(initialTasks);
    setTasks(initialTasks);
  }
  const [activeTask, setActiveTask] = useState<ExtendedTask | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const addForm = useForm<TaskFormValues>({
    resolver: zodResolver(createTaskSchema) as unknown as Resolver<TaskFormValues>,
    defaultValues: {
      projectId,
      milestoneId: '',
      title: '',
      description: '',
      status: TaskStatus.BACKLOG,
      priority: Priority.MEDIUM,
      dueDate: formatDateForInput(new Date()),
    },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(updateTaskSchema) as unknown as Resolver<TaskFormValues>,
    defaultValues: {
      title: '',
      description: '',
      milestoneId: '',
      status: TaskStatus.BACKLOG,
      priority: Priority.MEDIUM,
      dueDate: '',
    },
  });

  useEffect(() => {
    if (editingTask) {
      editForm.reset({
        title: editingTask.title,
        description: editingTask.description || '',
        milestoneId: editingTask.milestoneId || '',
        status: editingTask.status,
        priority: editingTask.priority,
        dueDate: formatDateForInput(editingTask.dueDate),
      });
    }
  }, [editingTask, editForm]);

  const onDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t)),
    );

    try {
      const result = await updateTaskStatusAction(taskId, workspaceId, projectId, newStatus);
      if (!result.success) {
        setTasks(previousTasks);
        toast.error(result.error || 'Failed to update task status');
      } else {
        toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
      }
    } catch {
      setTasks(previousTasks);
      toast.error('An error occurred');
    }
  };

  const handleCreateTask = async (values: TaskFormValues) => {
    const input: CreateTaskInput = {
      projectId,
      milestoneId: values.milestoneId === 'none' ? null : values.milestoneId || null,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: new Date(values.dueDate),
    };

    setIsLoading(true);
    try {
      const res = await createTaskAction(workspaceId, input);

      if (res.success) {
        toast.success('Task created successfully');
        setIsAddOpen(false);
        addForm.reset({ projectId, milestoneId: '', title: '', description: '', status: TaskStatus.BACKLOG, priority: Priority.MEDIUM, dueDate: formatDateForInput(new Date()) });
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create task');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (values: TaskFormValues) => {
    if (!editingTask) return;
    const input: UpdateTaskInput = {
      title: values.title,
      description: values.description,
      milestoneId: values.milestoneId === 'none' ? null : values.milestoneId || null,
      status: values.status,
      priority: values.priority,
      dueDate: new Date(values.dueDate),
    };

    setIsLoading(true);
    try {
      const res = await updateTaskAction(editingTask.id, workspaceId, projectId, input);

      if (res.success) {
        toast.success('Task updated successfully');
        setIsEditOpen(false);
        setEditingTask(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update task');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    setIsLoading(true);
    try {
      const res = await deleteTaskAction(deletingTaskId, workspaceId, projectId);
      if (res.success) {
        toast.success('Task deleted successfully');
        setIsDeleteOpen(false);
        setDeletingTaskId(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete task');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteOpen(true);
  };

  const deletingTask = tasks.find((t) => t.id === deletingTaskId);

  const renderTaskFormFields = (form: typeof addForm, isEdit: boolean) => (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground">Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Design homepage layout" disabled={isLoading} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground">Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Task details..." disabled={isLoading} {...field} className="min-h-[80px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground">Priority</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Priority).map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground">Due Date</FormLabel>
              <FormControl>
                <Input type="date" disabled={isLoading} {...field} value={formatDateForInput(field.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {isEdit && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskStatus).map((s) => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="milestoneId"
          render={({ field }) => (
            <FormItem className={!isEdit ? 'col-span-2' : ''}>
              <FormLabel className="text-xs font-medium text-foreground">Milestone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None (Unassigned)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Unassigned)</SelectItem>
                  {milestones.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {tasks.filter(t => t.status === TaskStatus.DONE).length} completed
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex w-full gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.status);
            return (
              <DroppableColumn
                key={col.status}
                id={col.status}
                className="flex min-h-[480px] w-[280px] shrink-0 flex-col rounded-lg border border-border bg-secondary/50 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                    {col.dot && <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />}
                    <span>{col.label}</span>
                  </span>
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-[4px] border border-border bg-background px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setIsEditOpen(true);
                        }}
                        onDelete={openDeleteDialog}
                      />
                    ))
                  )}
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[240px] rounded-md border border-foreground/40 bg-card p-3 opacity-95 shadow-xl">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">{activeTask.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`px-1.5 text-[11px] font-medium ${PRIORITY_COLORS[activeTask.priority]}`}>
                    {activeTask.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Add Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new task for this project.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateTask)} className="space-y-4">
              {renderTaskFormFields(addForm, false)}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Edit Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update task details, priority, and assignment.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTask)} className="space-y-4">
              {renderTaskFormFields(editForm, true)}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Delete Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete task <strong className="text-foreground">&quot;{deletingTask?.title}&quot;</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => { setIsDeleteOpen(false); setDeletingTaskId(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteTask}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
