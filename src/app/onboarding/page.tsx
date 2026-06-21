'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createWorkspaceSchema, CreateWorkspaceInput } from '@/features/workspace/schemas/workspace';
import { createWorkspaceAction } from '@/features/workspace/actions/workspace-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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

      // Redirect to the newly created workspace dashboard
      router.push(`/${result.data.slug}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create your workspace</CardTitle>
          <CardDescription>
            Let&apos;s set up a workspace for your freelancing business to track projects, clients, and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Freelance Business" disabled={isLoading} {...field} />
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
                    <FormLabel>Workspace URL Slug (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-muted-foreground">synclancer.com/</span>
                        <Input placeholder="my-business" disabled={isLoading} {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating workspace...' : 'Create Workspace'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
