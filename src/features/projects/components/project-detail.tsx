'use client';

import React, { useState, useEffect } from 'react';
import { Project, Client, Milestone, Task, MilestoneStatus } from '@prisma/client';
import { 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText, 
  Layers, 
  CheckSquare, 
  ArrowLeft, 
  Edit,
  TrendingUp,
  Mail,
  Phone,
  FileCheck,
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

import { createMilestoneSchema, updateMilestoneSchema } from '@/features/milestones/schemas/milestone';
import { createMilestoneAction, updateMilestoneAction, deleteMilestoneAction } from '@/features/milestones/actions/milestone-actions';
import { TaskKanbanBoard } from '@/features/tasks/components/task-kanban-board';
import { TimeTracker } from '@/features/time-tracking/components/time-tracker';
import { TimeEntry } from '@prisma/client';

interface ExtendedMilestone extends Milestone {
  tasks?: Task[];
}

interface ExtendedProject extends Project {
  client?: Client;
  milestones?: ExtendedMilestone[];
  tasks?: Task[];
  timeEntries?: (TimeEntry & { task?: Task | null })[];
}

interface ProjectDetailProps {
  project: ExtendedProject;
  workspaceSlug: string;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  ON_HOLD: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const MILESTONE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
  MEDIUM: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/30',
  HIGH: 'text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30',
  URGENT: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30',
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

  const formatDateForInput = (date: any) => {
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

  const handleCreateMilestone = async (values: any) => {
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMilestone = async (values: any) => {
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
          dueDate: new Date(values.dueDate),
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
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

  const formatCurrency = (amount: any, currency = 'USD') => {
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
            <Button variant="ghost" size="icon" className="h-9 w-9 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{project.name}</h1>
              <Badge className={`font-semibold uppercase tracking-wider text-[10px] ${STATUS_COLORS[project.status] || 'bg-slate-100 text-slate-800'}`}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{project.client?.companyName}</span>
            </p>
          </div>
        </div>
        <Link href={`/${workspaceSlug}/projects/${project.id}/edit`}>
          <Button variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            <Edit className="mr-2 h-4 w-4" /> Edit Project
          </Button>
        </Link>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'Overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main info card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-500" /> Description & Scope
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-indigo-500" /> Budget Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Project Value</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-slate-50">
                      {formatCurrency(project.budget, project.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Currency Code</span>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {project.currency}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-500" /> Key Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Start Date</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Deadline</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" /> Client Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{project.client?.companyName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary Account Partner</p>
                </div>
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{project.client?.primaryEmail}</span>
                  </div>
                  {project.client?.phone && (
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{project.client?.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" /> Project Health
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Overall Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">MILESTONES</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{project.milestones?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-950 p-2">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">TASKS</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{project.tasks?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'Milestones' && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" /> Milestones Timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Project milestones mapped sequentially. Create, edit, and track progress.
              </CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddMilestoneOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/10"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Milestone
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {!project.milestones || project.milestones.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-sm font-semibold">No milestones created yet</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 space-y-8 py-2">
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    {/* Circle bullet on line */}
                    <span className="absolute -left-[31px] top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-slate-250 bg-white dark:border-slate-700 dark:bg-slate-900">
                      <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    </span>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500 pt-1">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3.5 w-3.5" /> Due {formatDate(milestone.dueDate)}
                          </span>
                          <span>•</span>
                          <span>{milestone.tasks?.length || 0} tasks</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`w-fit uppercase tracking-wider text-[9px] font-semibold ${MILESTONE_STATUS_COLORS[milestone.status]}`}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200"
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
                          className="h-7 w-7 text-red-400 hover:text-red-650 dark:hover:text-red-400"
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
                      <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 p-3 space-y-2.5 border border-slate-100 dark:border-slate-900/60 max-w-xl">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between text-xs py-0.5">
                            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                              <CheckSquare className="h-3.5 w-3.5 text-indigo-500" />
                              {task.title}
                            </span>
                            <Badge variant="outline" className={`text-[9px] px-1.5 border tracking-wide uppercase font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>
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
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-500" /> Shared Files & Handover
            </CardTitle>
            <CardDescription className="text-xs">
              Storage features powered by Supabase client will go live in Phase 11.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-350">Storage Module Offline</h3>
            <p className="text-xs max-w-sm mx-auto mt-1.5">
              Supabase Storage client and file upload mechanisms will be connected during Phase 11.
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'Time Tracking' && (
        <TimeTracker
          project={project}
          initialTimeEntries={project.timeEntries || []}
          workspaceSlug={workspaceSlug}
        />
      )}

      {activeTab === 'Invoices' && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" /> Invoices
            </CardTitle>
            <CardDescription className="text-xs">
              Project milestones billing and PDF export features will go live in Phase 12.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-12 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-350">Billing Module Offline</h3>
            <p className="text-xs max-w-sm mx-auto mt-1.5">
              Create professional invoices, calculate tax rates, and export PDFs during Phase 12.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Add Milestone</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Initial Prototype Release" {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detail the criteria for this milestone..." {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addMilestoneForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={formatDateForInput(field.value)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800">
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
                <Button type="button" variant="outline" onClick={() => setIsAddMilestoneOpen(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                  {isLoading ? 'Creating...' : 'Create Milestone'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditMilestoneOpen} onOpenChange={setIsEditMilestoneOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Milestone</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Milestone Title" {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Scope criteria..." {...field} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editMilestoneForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={formatDateForInput(field.value)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
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
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-slate-905 border-slate-200 dark:border-slate-800">
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
                <Button type="button" variant="outline" onClick={() => setIsEditMilestoneOpen(false)} className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
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

      {/* Delete Milestone Confirmation */}
      <Dialog open={isDeleteMilestoneOpen} onOpenChange={setIsDeleteMilestoneOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Milestone</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete milestone <strong className="text-slate-900 dark:text-slate-100">"{selectedMilestone?.title}"</strong>? 
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
              className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteMilestone}
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
