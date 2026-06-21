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
  TrendingUp
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

interface ExtendedProject extends Project {
  client?: Client;
}

interface ProjectListProps {
  initialProjects: ExtendedProject[];
  workspaceId: string;
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
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your client engagements, budgets, milestones, and deliverables.
          </p>
        </div>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10">
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['ALL', 'DRAFT', 'ACTIVE', 'ON_HOLD', 'REVIEW', 'COMPLETED', 'CANCELLED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`text-xs font-semibold ${
                statusFilter === status 
                  ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-12 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 text-slate-400 dark:text-slate-500">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">No projects found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search filters.'
                  : 'Get started by creating your first project.'}
              </p>
            </div>
            {!searchQuery && statusFilter === 'ALL' && (
              <Link href={`/${workspaceSlug}/projects/new`}>
                <Button variant="outline" size="sm" className="mt-2 border-slate-200 dark:border-slate-800">
                  <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="group relative flex flex-col justify-between overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 rounded-xl"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Badge className={`font-semibold uppercase tracking-wider text-[10px] ${STATUS_COLORS[project.status] || 'bg-slate-100 text-slate-800'}`}>
                    {project.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer outline-none">
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${workspaceSlug}/projects/${project.id}`)}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => router.push(`/${workspaceSlug}/projects/${project.id}/edit`)}
                        className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          setDeletingProject(project);
                          setIsDeleteOpen(true);
                        }}
                        className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2 space-y-1">
                  <Link href={`/${workspaceSlug}/projects/${project.id}`} className="hover:underline">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {project.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    Client: <span className="text-slate-600 dark:text-slate-300">{project.client?.companyName || 'N/A'}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {project.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[40px]">
                    {project.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="space-y-1">
                    <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <DollarSign className="mr-1 h-3 w-3" /> Budget
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(project.budget, project.currency)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      <Calendar className="mr-1 h-3 w-3" /> Deadline
                    </span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(project.deadline)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center font-medium text-slate-500 dark:text-slate-400">
                      <TrendingUp className="mr-1 h-3.5 w-3.5 text-indigo-500" /> Progress
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Link href={`/${workspaceSlug}/projects/${project.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold pr-0">
                      View details <ChevronRight className="ml-1 h-3.5 w-3.5" />
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
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Project</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Are you sure you want to delete project <strong className="text-slate-900 dark:text-slate-100">"{deletingProject?.name}"</strong>? 
              This will not delete invoices or files, but it will hide this project and remove it from active plan limits.
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
              className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
