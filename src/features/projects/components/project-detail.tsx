'use client';
import type { Serialized } from '@/lib/serialize';

import { getErrorMessage } from '@/lib/errors';

import React, { useState, useEffect } from 'react';
import { Project, Client, Milestone, Task, MilestoneStatus, File as PrismaFile, Invoice, InvoiceItem } from '@prisma/client';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Layers, 
  CheckSquare, 
  ArrowLeft, 
  Edit,
  TrendingUp,
  Mail,
  Phone,
  User,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

import { createMilestoneSchema, updateMilestoneSchema, type CreateMilestoneInput, type UpdateMilestoneInput } from '@/features/milestones/schemas/milestone';
import { createMilestoneAction, updateMilestoneAction, deleteMilestoneAction } from '@/features/milestones/actions/milestone-actions';
import { TaskKanbanBoard } from '@/features/tasks/components/task-kanban-board';
import { TimeTracker } from '@/features/time-tracking/components/time-tracker';
import { FileManager } from '@/features/files/components/file-manager';
import { InvoiceManager } from '@/features/invoices/components/invoice-manager';
import { TimeEntry } from '@prisma/client';

interface ExtendedMilestone extends Milestone {
  tasks?: Task[];
}

// Serialized<>: the page converts Prisma Decimal (budget, invoice money columns)
// and File.fileSize BigInt before this crosses the Server -> Client boundary.
type ExtendedProject = Serialized<
  Project & {
    client?: Client;
    milestones?: ExtendedMilestone[];
    tasks?: Task[];
    timeEntries?: (TimeEntry & { task?: Task | null })[];
    files?: (PrismaFile & { uploader?: { fullName: string } | null })[];
    invoices?: (Invoice & { items: InvoiceItem[]; client: Client })[];
  }
>;

type CurrencyAmount = number | string | { toString(): string };

interface ProjectDetailProps {
  project: ExtendedProject;
  workspaceSlug: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground border border-border',
  ACTIVE: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  ON_HOLD: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
  REVIEW: 'bg-secondary text-foreground border border-border',
  COMPLETED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  CANCELLED: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-muted text-muted-foreground border border-border',
  IN_PROGRESS: 'bg-secondary text-foreground border border-border',
  COMPLETED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-muted-foreground bg-muted border-border',
  MEDIUM: 'text-foreground bg-secondary border-border',
  HIGH: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-300',
  URGENT: 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400',
};

export function ProjectDetail({ project, workspaceSlug }: ProjectDetailProps) {
  const router = useRouter();
  const tabs = ['Overview', 'Milestones', 'Tasks', 'Files', 'Time Tracking', 'Invoices'];
  const [activeTab, setActiveTab] = useState('Overview');

  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [isEditMilestoneOpen, setIsEditMilestoneOpen] = useState(false);
  const [isDeleteMilestoneOpen, setIsDeleteMilestoneOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const addMilestoneForm = useForm({
    resolver: zodResolver(createMilestoneSchema),
    defaultValues: {
      projectId: project.id,
      title: '',
      description: '',
      dueDate: formatDateForInput(new Date(project.deadline)),
      status: MilestoneStatus.NOT_STARTED,
      sortOrder: 0,
    },
  });

  const editMilestoneForm = useForm({
    resolver: zodResolver(updateMilestoneSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      status: MilestoneStatus.NOT_STARTED,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (selectedMilestone) {
      editMilestoneForm.reset({
        title: selectedMilestone.title,
        description: selectedMilestone.description || '',
        dueDate: formatDateForInput(selectedMilestone.dueDate),
        status: selectedMilestone.status,
        sortOrder: selectedMilestone.sortOrder,
      });
    }
  }, [selectedMilestone, editMilestoneForm]);

  const handleCreateMilestone = async (values: CreateMilestoneInput) => {
    setIsLoading(true);
    try {
      const res = await createMilestoneAction(project.workspaceId, {
        projectId: project.id,
        title: values.title,
        description: values.description,
        dueDate: new Date(values.dueDate),
        status: values.status,
        sortOrder: Number(values.sortOrder),
      });

      if (res.success) {
        toast.success('Milestone created successfully');
        setIsAddMilestoneOpen(false);
        addMilestoneForm.reset();
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create milestone');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMilestone = async (values: UpdateMilestoneInput) => {
    if (!selectedMilestone) return;
    setIsLoading(true);
    try {
      const res = await updateMilestoneAction(
        selectedMilestone.id,
        project.workspaceId,
        project.id,
        {
          title: values.title,
          description: values.description,
          dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
          status: values.status,
          sortOrder: Number(values.sortOrder),
        }
      );

      if (res.success) {
        toast.success('Milestone updated successfully');
        setIsEditMilestoneOpen(false);
        setSelectedMilestone(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update milestone');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!selectedMilestone) return;
    setIsLoading(true);
    try {
      const res = await deleteMilestoneAction(
        selectedMilestone.id,
        project.workspaceId,
        project.id
      );

      if (res.success) {
        toast.success('Milestone deleted successfully');
        setIsDeleteMilestoneOpen(false);
        setSelectedMilestone(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete milestone');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: CurrencyAmount, currency = 'USD') => {
    const num = parseFloat(amount.toString());
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${workspaceSlug}/projects`}>
            <Button variant="ghost" size="icon" className="cursor-pointer h-9 w-9 border border-border text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">{project.name}</h1>
              <Badge className={`font-semibold text-[11px] ${STATUS_COLORS[project.status] || 'bg-muted text-muted-foreground border border-border'}`}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Client: <span className="font-semibold text-foreground">{project.client?.companyName}</span>
            </p>
          </div>
        </div>
        <Link href={`/${workspaceSlug}/projects/${project.id}/edit`}>
          <Button variant="outline" className="cursor-pointer border-border text-foreground font-medium">
            <Edit className="mr-2 h-4 w-4" /> Edit Project
          </Button>
        </Link>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 px-1 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap -mb-px",
              activeTab === tab
                ? "border-brand text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main info card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border bg-card rounded-lg">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-brand" /> Description & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-border bg-card rounded-lg">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-brand" /> Budget Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Project Value</span>
                    <p className="font-heading text-2xl font-bold text-foreground font-mono tabular-nums">
                      {formatCurrency(project.budget, project.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Currency Code</span>
                    <p className="text-sm font-semibold font-mono text-foreground">
                      {project.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card rounded-lg">
                <CardHeader className="border-b border-border pb-4">
                  <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand" /> Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Start Date</span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Deadline</span>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card rounded-lg">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-brand" /> Client Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">{project.client?.companyName}</p>
                  <p className="text-xs text-muted-foreground">Primary Account Partner</p>
                </div>
                <div className="space-y-3 pt-3 border-t border-border text-xs">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{project.client?.primaryEmail}</span>
                  </div>
                  {project.client?.phone && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{project.client?.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card rounded-lg">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand" /> Project Health
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Overall Progress</span>
                    <span className="font-mono tabular-nums text-foreground">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                  <div className="rounded-lg bg-muted/40 border border-border p-2.5">
                    <p className="text-[11px] font-medium text-muted-foreground">Milestones</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-foreground mt-0.5">{project.milestones?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border p-2.5">
                    <p className="text-[11px] font-medium text-muted-foreground">Tasks</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-foreground mt-0.5">{project.tasks?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'Milestones' && (
        <Card className="border-border bg-card rounded-lg">
          <CardHeader className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand" /> Milestones Timeline
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Project milestones mapped sequentially. Create, edit, and track progress.
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddMilestoneOpen(true)}
              className="text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Milestone
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {!project.milestones || project.milestones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">No milestones created yet</p>
              </div>
            ) : (
              <div className="relative border-l border-border pl-6 space-y-8 py-2">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    {/* Circle bullet on line */}
                    <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-border bg-card">
                      <span className="h-2 w-2 rounded-full bg-brand"></span>
                    </span>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3.5 w-3.5" /> Due {formatDate(milestone.dueDate)}
                          </span>
                          <span>·</span>
                          <span className="tabular-nums">{milestone.tasks?.length || 0} tasks</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`w-fit text-[11px] font-semibold ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setIsEditMilestoneOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setIsDeleteMilestoneOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Simple task items list under milestone */}
                    {milestone.tasks && milestone.tasks.length > 0 && (
                      <div className="mt-4 rounded-lg bg-muted/30 p-3 space-y-2.5 border border-border max-w-xl">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <CheckSquare className="h-3.5 w-3.5 text-brand" />
                              {task.title}
                            </span>
                            <Badge variant="outline" className={`cursor-pointer text-[11px] px-1.5 border font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'Tasks' && (
        <TaskKanbanBoard
          initialTasks={project.tasks || []}
          milestones={project.milestones || []}
          projectId={project.id}
          workspaceId={project.workspaceId}
          workspaceSlug={workspaceSlug}
        />
      )}

      {activeTab === 'Files' && (
        <FileManager
          projectId={project.id}
          workspaceId={project.workspaceId}
          initialFiles={project.files || []}
          workspaceSlug={workspaceSlug}
        />
      )}

      {activeTab === 'Time Tracking' && (
        <TimeTracker
          project={project}
          initialTimeEntries={project.timeEntries || []}
          workspaceSlug={workspaceSlug}
        />
      )}

      {activeTab === 'Invoices' && (
        <InvoiceManager
          projectId={project.id}
          workspaceId={project.workspaceId}
          clientId={project.clientId}
          initialInvoices={project.invoices || []}
          workspaceSlug={workspaceSlug}
        />
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Add Milestone</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new delivery milestone for this project.
            </DialogDescription>
          </DialogHeader>
          <Form {...addMilestoneForm}>
            <form onSubmit={addMilestoneForm.handleSubmit(handleCreateMilestone)} className="space-y-4">
              <FormField
                control={addMilestoneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Initial Prototype Release" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addMilestoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detail the criteria for this milestone..." {...field} className="bg-background border-border min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={addMilestoneForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={formatDateForInput(field.value)} className="bg-background border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addMilestoneForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="bg-background border-border font-mono tabular-nums" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addMilestoneForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {Object.values(MilestoneStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddMilestoneOpen(false)} className="cursor-pointer border-border text-foreground font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="font-semibold">
                  {isLoading ? 'Creating...' : 'Create Milestone'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditMilestoneOpen} onOpenChange={setIsEditMilestoneOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Edit Milestone</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update milestone settings, deadlines, and completion status.
            </DialogDescription>
          </DialogHeader>
          <Form {...editMilestoneForm}>
            <form onSubmit={editMilestoneForm.handleSubmit(handleUpdateMilestone)} className="space-y-4">
              <FormField
                control={editMilestoneForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Milestone Title" {...field} className="bg-background border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editMilestoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Scope criteria..." {...field} className="bg-background border-border min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={editMilestoneForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={formatDateForInput(field.value)} className="bg-background border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editMilestoneForm.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="bg-background border-border font-mono tabular-nums" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editMilestoneForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {Object.values(MilestoneStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsEditMilestoneOpen(false)} className="cursor-pointer border-border text-foreground font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="font-semibold">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Milestone Confirmation */}
      <Dialog open={isDeleteMilestoneOpen} onOpenChange={setIsDeleteMilestoneOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Delete Milestone</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete milestone <strong className="text-foreground">&ldquo;{selectedMilestone?.title}&rdquo;</strong>?
              This action is permanent and will delete all associated tasks under this milestone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteMilestoneOpen(false);
                setSelectedMilestone(null);
              }}
              className="cursor-pointer border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteMilestone}
              className="cursor-pointer font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
