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
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200 shadow-none',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-150 shadow-none',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-150 shadow-none',
  REVIEW: 'bg-cyan-50 text-cyan-700 border-cyan-150 shadow-none',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-150 shadow-none',
  CANCELLED: 'bg-red-50 text-red-700 border-red-150 shadow-none',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage active client engagements, budgets, milestones, and deliverables.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button className="cursor-pointer font-medium text-sm h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white text-sm h-10 rounded-lg border-slate-250"
          />
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 self-start max-w-full overflow-x-auto">
          {['ALL', 'ACTIVE', 'ON_HOLD', 'REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
                statusFilter === status
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-slate-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-450 mb-4 border border-slate-100">
            <Briefcase className="h-6 w-6 text-slate-550" />
          </div>
          <CardTitle className="text-base font-bold text-slate-900">No projects found</CardTitle>
          <CardDescription className="max-w-sm mt-2 text-sm text-slate-500">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or filters.'
              : 'Create a project scope to track milestones, tasks, files and log billable times.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'ALL' && (
            <Link href={`/${workspaceSlug}/projects/new`}>
              <Button className="mt-5 flex items-center gap-2 cursor-pointer font-medium text-sm h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg shadow-sm">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/50 h-[48px]">
                  <th className="px-6 align-middle font-medium">Project Name</th>
                  <th className="px-6 align-middle font-medium">Client</th>
                  <th className="px-6 align-middle font-medium">Status</th>
                  <th className="px-6 align-middle font-medium">Budget</th>
                  <th className="px-6 align-middle font-medium">Progress</th>
                  <th className="px-6 align-middle font-medium">Due Date</th>
                  <th className="px-6 align-middle font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredProjects.map((project) => {
                  return (
                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors h-[60px]">
                      <td className="px-6 align-middle">
                        <Link href={`/${workspaceSlug}/projects/${project.id}`} className="font-semibold text-slate-900 hover:text-blue-650 hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 align-middle text-slate-600 font-medium">
                        {project.client?.companyName || '—'}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shadow-none", STATUS_THEMES[project.status] || 'bg-slate-100 text-slate-800')}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 align-middle font-mono font-medium text-slate-900">
                        {formatCurrency(project.budget, project.currency)}
                      </td>
                      <td className="px-6 align-middle min-w-[140px]">
                        <div className="flex items-center gap-2 max-w-[150px]">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-300" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-700">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 align-middle text-slate-500 text-xs">
                        {formatDate(project.deadline)}
                      </td>
                      <td className="px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/projects/${project.id}`}>
                            <Button variant="ghost" size="icon" title="View details" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/${workspaceSlug}/projects/${project.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit project" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete project" 
                            onClick={() => {
                              setDeletingProject(project);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-650 rounded-md cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
