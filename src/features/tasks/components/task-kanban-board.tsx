'use client';

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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Flag,
  Layers,
  GripVertical,
  AlertCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { createTaskSchema, updateTaskSchema } from '@/features/tasks/schemas/task';
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

// Column definitions
const COLUMNS: { label: string; status: TaskStatus; color: string; dotColor: string }[] = [
  { label: 'Backlog', status: TaskStatus.BACKLOG, color: 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800', dotColor: 'bg-slate-400' },
  { label: 'To Do', status: TaskStatus.TODO, color: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50', dotColor: 'bg-blue-500' },
  { label: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50', dotColor: 'bg-amber-500' },
  { label: 'Review', status: TaskStatus.REVIEW, color: 'bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/50', dotColor: 'bg-purple-500' },
  { label: 'Done', status: TaskStatus.DONE, color: 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50', dotColor: 'bg-emerald-500' },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400',
  MEDIUM: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400',
  HIGH: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900/40 dark:text-orange-400',
  URGENT: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-400',
};

const PRIORITY_DOT_COLORS: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

// Droppable Column Component
function DroppableColumn({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-200 ${isOver ? 'ring-2 ring-indigo-400/50 bg-indigo-50/30 dark:bg-indigo-950/10' : ''}`}
    >
      {children}
    </div>
  );
}

// Draggable Task Card Component
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
      className={`group relative rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all duration-150 ${
        isDragging ? 'opacity-50 shadow-lg scale-[1.02] z-50' : ''
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 shrink-0"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50 truncate">{task.title}</h4>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pl-6">{task.description}</p>
        )}

        <div className="flex items-center justify-between pl-6">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-[9px] px-1.5 border tracking-wide uppercase font-semibold ${PRIORITY_COLORS[task.priority]}`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${PRIORITY_DOT_COLORS[task.priority]}`}></span>
              {task.priority}
            </Badge>
            {task.milestone && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {task.milestone.title}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export function TaskKanbanBoard({ initialTasks, milestones, projectId, workspaceId, workspaceSlug }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ExtendedTask[]>(initialTasks);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTask, setActiveTask] = useState<ExtendedTask | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const formatDateForInput = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const addForm = useForm({
    resolver: zodResolver(createTaskSchema),
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

  const editForm = useForm({
    resolver: zodResolver(updateTaskSchema),
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

  const handleCreateTask = async (values: any) => {
    setIsLoading(true);
    try {
      const res = await createTaskAction(workspaceId, {
        projectId,
        milestoneId: values.milestoneId || null,
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        dueDate: new Date(values.dueDate),
      });

      if (res.success) {
        toast.success('Task created successfully');
        setIsAddOpen(false);
        addForm.reset({ projectId, milestoneId: '', title: '', description: '', status: TaskStatus.BACKLOG, priority: Priority.MEDIUM, dueDate: formatDateForInput(new Date()) });
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create task');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTask = async (values: any) => {
    if (!editingTask) return;
    setIsLoading(true);
    try {
      const res = await updateTaskAction(editingTask.id, workspaceId, projectId, {
        title: values.title,
        description: values.description,
        milestoneId: values.milestoneId || null,
        status: values.status,
        priority: values.priority,
        dueDate: new Date(values.dueDate),
      });

      if (res.success) {
        toast.success('Task updated successfully');
        setIsEditOpen(false);
        setEditingTask(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update task');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteOpen(true);
  };

  if (!isMounted) return null;

  const deletingTask = tasks.find((t) => t.id === deletingTaskId);

  // Task form fields used by both Add and Edit dialogs
  const renderTaskFormFields = (form: any, isEdit: boolean) => (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Design homepage layout" disabled={isLoading} {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Task details..." disabled={isLoading} {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="priority"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Priority</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
          render={({ field }: any) => (
            <FormItem>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Due Date</FormLabel>
              <FormControl>
                <Input type="date" disabled={isLoading} {...field} value={formatDateForInput(field.value)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
            render={({ field }: any) => (
              <FormItem>
                <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
          render={({ field }: any) => (
            <FormItem className={!isEdit ? 'col-span-2' : ''}>
              <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Milestone</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="None (Unassigned)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
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
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {tasks.filter(t => t.status === TaskStatus.DONE).length} completed
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/10"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.status);
            return (
              <DroppableColumn
                key={col.status}
                id={col.status}
                className={`flex flex-col rounded-xl border p-3 min-h-[420px] w-full ${col.color}`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dotColor}`}></span>
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider">{col.label}</span>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[10px] font-bold h-5 min-w-[20px] flex items-center justify-center">
                    {columnTasks.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-600">
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border border-indigo-300 bg-white p-3 shadow-xl dark:border-indigo-700 dark:bg-slate-900 opacity-90 rotate-2 w-[240px]">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50">{activeTask.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] px-1.5 border tracking-wide uppercase font-semibold ${PRIORITY_COLORS[activeTask.priority]}`}>
                    {activeTask.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Add Task</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Create a new task for this project.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateTask)} className="space-y-4">
              {renderTaskFormFields(addForm, false)}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {isLoading ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Task</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Update task details, priority, and assignment.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateTask)} className="space-y-4">
              {renderTaskFormFields(editForm, true)}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Task</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete task <strong className="text-slate-900 dark:text-slate-100">&quot;{deletingTask?.title}&quot;</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => { setIsDeleteOpen(false); setDeletingTaskId(null); }}
              className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
