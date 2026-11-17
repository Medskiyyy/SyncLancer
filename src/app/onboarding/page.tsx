'use client';

import { getErrorMessage } from '@/lib/errors';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, CreateWorkspaceInput } from '@/features/workspace/schemas/workspace';
import { createWorkspaceAction } from '@/features/workspace/actions/workspace-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthShell } from '@/components/auth/auth-shell';

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createWorkspaceAction(data);
      if (!result.success || !result.data) {
        setError(result.error || 'Failed to create workspace');
        return;
      }

      router.push(`/${result.data.slug}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Create your workspace
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up an isolated workspace to manage your clients, projects, and invoices.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace name</FormLabel>
                  <FormControl>
                    <Input placeholder="Aksara Studio" disabled={isLoading} className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace URL slug (optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">synclancer.com/</span>
                      <Input placeholder="aksara-studio" disabled={isLoading} className="h-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-2 h-10 w-full" disabled={isLoading}>
              {isLoading ? 'Creating workspace...' : 'Create Workspace'}
            </Button>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
}
