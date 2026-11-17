'use client';
import type { Serialized } from '@/lib/serialize';

import { getErrorMessage } from '@/lib/errors';
import React, { useState } from 'react';
import { Project, Client, ProjectTemplate, ProjectStatus } from '@prisma/client';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Briefcase, Calendar, DollarSign, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';

import { createProjectSchema, updateProjectSchema } from '../schemas/project';
import { createProjectAction, updateProjectAction } from '../actions/project-actions';

// Serialized<>: the page converts Prisma Decimal (budget) to number before this
// crosses the Server -> Client Component boundary.
type ExtendedProject = Serialized<Project & { client?: Client }>;

interface ProjectBuilderProps {
  workspaceId: string;
  workspaceSlug: string;
  clients: Client[];
  templates: ProjectTemplate[];
  activeProjectsCount: number;
  plan: 'FREE' | 'PRO';
  project?: ExtendedProject | null;
}

export function ProjectBuilder({
  workspaceId,
  workspaceSlug,
  clients,
  templates,
  activeProjectsCount,
  plan,
  project = null,
}: ProjectBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!project;

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const [defaultDates] = useState(() => ({
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));

  const form = useForm({
    resolver: zodResolver(isEdit ? updateProjectSchema : createProjectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      clientId: project?.clientId || '',
      budget: project ? parseFloat(project.budget.toString()) : 0,
      currency: project?.currency || 'USD',
      startDate: project ? formatDateForInput(project.startDate) : defaultDates.startDate,
      deadline: project ? formatDateForInput(project.deadline) : defaultDates.deadline,
      status: project?.status || ProjectStatus.DRAFT,
      templateId: '',
    },
  });

  const selectedStatus = useWatch({ control: form.control, name: 'status' });

  // Check if active project limit is reached
  const originalStatusWasActive = project?.status === ProjectStatus.ACTIVE;
  const isLimitReached = plan === 'FREE' && activeProjectsCount >= 3;
  const showLimitWarning = selectedStatus === ProjectStatus.ACTIVE && !originalStatusWasActive && isLimitReached;

  // Derived from the form itself: the resolver switches between the create and
  // update schema, so this stays correct without restating either shape.
  type ProjectFormValues = Parameters<Parameters<typeof form.handleSubmit>[0]>[0];

  const onSubmit = async (values: ProjectFormValues) => {
    if (showLimitWarning) {
      toast.error('Limit Exceeded: Cannot set project to ACTIVE status. Upgrade to Pro.');
      return;
    }

    setIsLoading(true);
    try {
      // The update schema marks the dates optional, so guard instead of calling
      // new Date(undefined), which would silently persist an Invalid Date.
      const toDate = (value: Date | string | undefined) =>
        value === undefined || value === '' ? undefined : new Date(value);

      if (isEdit && project) {
        const updateInput = {
          name: values.name,
          description: values.description,
          budget: Number(values.budget),
          currency: values.currency,
          startDate: toDate(values.startDate),
          deadline: toDate(values.deadline),
          status: values.status,
        };
        const res = await updateProjectAction(project.id, workspaceId, updateInput);
        if (res.success) {
          toast.success('Project updated successfully');
          router.push(`/${workspaceSlug}/projects/${project.id}`);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to update project');
        }
      } else {
        // `values` is typed as the union of both schemas because the resolver is
        // chosen at runtime. Re-parsing narrows it to the create shape, where
        // clientId and the dates are guaranteed present.
        const created = createProjectSchema.parse(values);
        const createInput = {
          name: created.name,
          description: created.description,
          clientId: created.clientId,
          budget: Number(created.budget),
          currency: created.currency,
          startDate: new Date(created.startDate),
          deadline: new Date(created.deadline),
          status: created.status,
          templateId: created.templateId === '' ? undefined : created.templateId,
        };
        const res = await createProjectAction(workspaceId, createInput);
        if (res.success && res.data) {
          toast.success('Project created successfully');
          router.push(`/${workspaceSlug}/projects/${res.data.id}`);
          router.refresh();
        } else {
          toast.error(res.error || 'Failed to create project');
        }
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={isEdit ? `/${workspaceSlug}/projects/${project.id}` : `/${workspaceSlug}/projects`}>
          <Button variant="ghost" size="icon" className="h-9 w-9 border border-border text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? 'Edit Project' : 'New Project'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update project settings, status, and budget details.' : 'Create a project, select a client, and launch from a template.'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-border bg-card rounded-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand" /> Project Specifications
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Fill in the basic workspace parameters for this engagement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Project Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Nusantara Portal Redesign" 
                        {...field} 
                        className="bg-background border-border"
                      />
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
                    <FormLabel className="text-foreground font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail the scope of work and goals..." 
                        {...field} 
                        className="bg-background border-border min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Client</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Select Client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-border">
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.companyName} ({client.primaryEmail})
                              </SelectItem>
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
                  name="status"
                  render={({ field }) => (
                    <FormItem className={isEdit ? 'sm:col-span-2' : ''}>
                      <FormLabel className="text-foreground font-medium">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          {Object.values(ProjectStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px] text-muted-foreground">
                        Active status counts towards subscription active project limits.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {showLimitWarning && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Active Projects Limit Reached</p>
                    <p className="text-xs">
                      You already have {activeProjectsCount} active projects. The Free plan allows a maximum of 3 active projects.
                      You cannot set this project to ACTIVE. Save as DRAFT or upgrade your plan.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-lg">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand" /> Budget & Timeline
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Configure financials and dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Budget</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-background border-border font-mono tabular-nums"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="Select Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="IDR">IDR (Rp)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={formatDateForInput(field.value)}
                          className="bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Deadline</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={formatDateForInput(field.value)}
                          className="bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {!isEdit && (
            <Card className="border-border bg-card rounded-lg">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand" /> Predefined Milestones & Tasks Template
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Optional: Automatically pre-populate your milestones and task list.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium">Project Template</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-border">
                            <SelectValue placeholder="No template (create blank project)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="">No template (create blank project)</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px] text-muted-foreground">
                        Selecting a template auto-generates structured milestones and tasks evenly scheduled between your Start Date and Deadline.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={isEdit ? `/${workspaceSlug}/projects/${project.id}` : `/${workspaceSlug}/projects`}>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isLoading}
                className="border-border text-foreground font-medium"
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading || showLimitWarning}
              className="font-semibold"
            >
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
