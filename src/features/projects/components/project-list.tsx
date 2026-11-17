'use client';

import React, { useState } from 'react';
import type { Serialized } from '@/lib/serialize';
import { Project, Client } from '@prisma/client';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Edit, 
  Trash2, 
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { FadeIn } from '@/components/ui/motion';

// Serialized<> because the page converts Prisma Decimal (budget) to number
// before handing this across the Server -> Client Component boundary.
type ExtendedProject = Serialized<Project & { client?: Client }>;

interface ProjectListProps {
  initialProjects: ExtendedProject[];
  workspaceId: string;
  workspaceSlug: string;
}

const STATUS_THEMES: Record<string, string> = {
  DRAFT: 'border-border bg-secondary text-foreground shadow-none',
  ACTIVE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-none',
  ON_HOLD: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-none',
  REVIEW: 'border-border bg-secondary text-foreground shadow-none',
  COMPLETED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-none',
  CANCELLED: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400 shadow-none',
};

export function ProjectList({ initialProjects, workspaceId, workspaceSlug }: ProjectListProps) {
  const [projects, setProjects] = useState<ExtendedProject[]>(initialProjects);
  const [syncedProjects, setSyncedProjects] = useState(initialProjects);
  if (initialProjects !== syncedProjects) {
    setSyncedProjects(initialProjects);
    setProjects(initialProjects);
  }
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
    } catch {
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

  const formatCurrency = (amount: number | string, currency = 'USD') => {
    const num = parseFloat(amount.toString());
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <FadeIn direction="up" delay={0.02} duration={0.3} className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage active client engagements, budgets, milestones, and deliverables.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button variant="default">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex max-w-full self-start overflow-x-auto rounded-md border border-border bg-secondary p-1">
          {['ALL', 'ACTIVE', 'ON_HOLD', 'REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'whitespace-nowrap rounded-[4px] px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                statusFilter === status
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border bg-secondary/40 p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
            <Briefcase className="h-6 w-6 text-brand" strokeWidth={1.75} />
          </div>
          <CardTitle className="font-heading text-base font-bold text-foreground">No projects found</CardTitle>
          <CardDescription className="mt-2 max-w-sm text-sm text-muted-foreground">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search query or filters.'
              : 'Create a project scope to track milestones, tasks, files and log billable times.'}
          </CardDescription>
          {!searchQuery && statusFilter === 'ALL' && (
            <Link href={`/${workspaceSlug}/projects/new`}>
              <Button variant="default" className="mt-5 gap-2">
                <Plus className="h-4 w-4" /> Create Project
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="h-11 border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <th className="px-6 align-middle">Project Name</th>
                  <th className="px-6 align-middle">Client</th>
                  <th className="px-6 align-middle">Status</th>
                  <th className="px-6 align-middle">Budget</th>
                  <th className="px-6 align-middle">Progress</th>
                  <th className="px-6 align-middle">Due Date</th>
                  <th className="px-6 text-right align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-transparent">
                {filteredProjects.map((project) => {
                  return (
                    <tr key={project.id} className="h-[58px] transition-colors hover:bg-secondary/40">
                      <td className="px-6 align-middle">
                        <Link href={`/${workspaceSlug}/projects/${project.id}`} className="font-semibold text-foreground underline-offset-4 hover:underline">
                          {project.name}
                        </Link>
                      </td>
                      <td className="px-6 align-middle font-medium text-muted-foreground">
                        {project.client?.companyName || '-'}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge className={cn('rounded-[5px] border px-2 py-0.5 text-[11px] font-medium shadow-none', STATUS_THEMES[project.status] || 'border-border bg-secondary text-foreground')}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 align-middle font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(project.budget, project.currency)}
                      </td>
                      <td className="min-w-[140px] px-6 align-middle">
                        <div className="flex max-w-[150px] items-center gap-2">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className="h-full rounded-full bg-brand transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 align-middle text-xs text-muted-foreground">
                        {formatDate(project.deadline)}
                      </td>
                      <td className="px-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/projects/${project.id}`}>
                            <Button variant="ghost" size="icon" title="View details" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/${workspaceSlug}/projects/${project.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Edit project" className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="rounded-lg border border-border bg-popover p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span>Delete Project</span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs text-muted-foreground">
              Are you sure you want to delete project <strong className="text-foreground">&ldquo;{deletingProject?.name}&rdquo;</strong>?
              This will hide this project and remove it from active plan limits, but will not delete related invoices or uploaded files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
            >
              {isLoading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
