'use client';

import React, { useState } from 'react';
import { Project, Client } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { deleteProjectAction } from '../actions/project-actions';
import { cn } from '@/lib/utils';

interface ExtendedProject extends Project {
  client?: Client;
}

interface ProjectListProps {
  initialProjects: ExtendedProject[];
  workspaceId: string;
  workspaceSlug: string;
}

const STATUS_THEMES: Record<string, string> = {
  DRAFT: 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-505 border-zinc-200/60 dark:border-zinc-850',
  ACTIVE: 'bg-green-550/10 text-green-600 dark:text-green-400 border-green-550/15',
  ON_HOLD: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15',
  REVIEW: 'bg-stone-500/10 text-stone-650 dark:text-stone-400 border-stone-550/15',
  COMPLETED: 'bg-amber-550/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-red-500/10 text-red-655 dark:text-red-400 border-red-550/15',
};

export function ProjectList({ initialProjects, workspaceId, workspaceSlug }: ProjectListProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ExtendedProject[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [deletingProject, setDeletingProject] = useState<ExtendedProject | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsLoading(true);
    try {
      const result = await deleteProjectAction(deletingProject.id, workspaceId);
      if (result.success) {
        toast.success('Project deleted successfully');
        setProjects(prev => prev.filter(p => p.id !== deletingProject.id));
        setIsDeleteOpen(false);
        setDeletingProject(null);
      } else {
        toast.error(result.error || 'Failed to delete project');
      }
    } catch (err) {
      toast.error('An error occurred while deleting the project');
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-55">Projects Directory</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your active client engagements, budgets, milestones, and deliverables.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button className="cursor-pointer font-semibold text-xs h-9">
            <Plus className="mr-1.5 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-505" />
          <Input
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900 text-xs h-9 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 self-start max-w-full overflow-x-auto">
          {['ALL', 'ACTIVE', 'ON_HOLD', 'REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
                statusFilter === status
                  ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-zinc-200/60 dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 mb-4 border border-zinc-200/50 dark:border-zinc-800/80">
            <Briefcase className="h-6 w-6 text-zinc-400" />
          </div>
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-55">No projects found</CardTitle>
          <CardDescription className="max-w-sm mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or filters.'
              : 'Create a project scope to track milestones, tasks, files and log billable times.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'ALL' && (
            <Link href={`/${workspaceSlug}/projects/new`}>
              <Button className="mt-4 flex items-center gap-2 cursor-pointer font-semibold text-xs h-9">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="group relative flex flex-col justify-between overflow-hidden border-zinc-200/70 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover-lift rounded-xl"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge className={cn("text-[9px] font-bold px-1.5 py-0.5 border shadow-xs", STATUS_THEMES[project.status] || 'bg-zinc-100 text-zinc-800')}>
                    {project.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer outline-none transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg">
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${workspaceSlug}/projects/${project.id}`)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${workspaceSlug}/projects/${project.id}/edit`)}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setDeletingProject(project);
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-md hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-3 space-y-1">
                  <Link href={`/${workspaceSlug}/projects/${project.id}`} className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors inline-block leading-snug">
                    {project.name}
                  </Link>
                  <CardDescription className="text-[10px] font-bold text-zinc-400">
                    Client: <span className="text-zinc-750 dark:text-zinc-350">{project.client?.companyName || 'None'}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {project.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-2 min-h-[32px] font-medium leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <span className="flex items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <DollarSign className="mr-1 h-3.5 w-3.5" /> Budget
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                      {formatCurrency(project.budget, project.currency)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <Calendar className="mr-1 h-3.5 w-3.5" /> Deadline
                    </span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {formatDate(project.deadline)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/65">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center text-zinc-500 dark:text-zinc-450">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-amber-500" /> Progress
                    </span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Link href={`/${workspaceSlug}/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="cursor-pointer text-[10px] text-zinc-550 dark:text-zinc-400 hover:text-primary dark:hover:text-primary hover:bg-transparent dark:hover:bg-transparent font-bold pr-0 h-7 flex items-center gap-0.5">
                      <span>Explore details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span>Delete Project</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-550 text-xs mt-2">
              Are you sure you want to delete project <strong className="text-zinc-850 dark:text-zinc-100">&ldquo;{deletingProject?.name}&rdquo;</strong>? 
              This will hide this project and remove it from active plan limits, but will not delete related invoices or uploaded files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingProject(null);
              }}
              className="cursor-pointer text-xs h-9 font-semibold bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
              className="cursor-pointer text-xs h-9 font-semibold"
            >
              {isLoading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
