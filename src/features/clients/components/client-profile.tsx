'use client';
import type { Serialized } from '@/lib/serialize';

import React, { useState } from 'react';
import { Client, Project, Proposal, Invoice, ClientUser, User, File as PrismaFile } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Mail, 
  Phone, 
  FolderKanban, 
  FileText, 
  Receipt, 
  FolderOpen, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { inviteClientPortalAction } from '../actions/client-actions';
import { cn } from '@/lib/utils';

// `user` is the safe projection (no passwordHash) — see lib/safe-user-select.
type ExtendedClientUser = ClientUser & {
  user: Pick<User, 'id' | 'email' | 'fullName' | 'avatarUrl' | 'emailVerified' | 'createdAt'> & { hasPassword: boolean };
};

// Serialized<>: the page converts Prisma Decimal money columns to numbers before
// this crosses the Server -> Client Component boundary.
type ClientWithRelations = Serialized<
  Client & {
    projects: Project[];
    proposals: Proposal[];
    invoices: Invoice[];
    portalUsers: ExtendedClientUser[];
  }
>;

// Matches ClientService.getClientFiles(); Serialized<> turns File.fileSize from
// bigint into number, which is what lets it cross into a Client Component at all.
type ClientFile = Serialized<
  PrismaFile & { uploader: Pick<User, 'id' | 'email' | 'fullName' | 'avatarUrl'> }
>;

interface ClientProfileProps {
  client: ClientWithRelations;
  files: ClientFile[];
  workspaceId: string;
  workspaceSlug: string;
}

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  title: z.string().min(2, 'Job title must be at least 2 characters'),
});

type InviteInput = z.infer<typeof inviteSchema>;

export function ClientProfile({ client, files, workspaceId, workspaceSlug }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'files'>('overview');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [portalUsers, setPortalUsers] = useState<ExtendedClientUser[]>(client.portalUsers);

  const inviteForm = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      title: '',
    },
  });

  const handleInviteUser = async (data: InviteInput) => {
    setIsLoading(true);
    try {
      const result = await inviteClientPortalAction(
        workspaceId,
        client.id,
        data.email,
        data.title
      );

      if (result.success && result.data) {
        toast.success('Invitation sent to representative');
        setIsInviteOpen(false);
        inviteForm.reset();
        
        // Optimistically add client user to list
        const newClientUser = result.data as ExtendedClientUser;
        setPortalUsers(prev => [...prev, newClientUser]);
      } else {
        toast.error(result.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card className="overflow-hidden border border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
                <div>
                  <CardTitle className="font-heading text-sm font-bold text-foreground">Projects Scopes</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Active and completed scopes of work under this client account</CardDescription>
                </div>
                <Badge variant="secondary" className="border border-border bg-secondary px-2 py-0.5 font-mono text-[11px]">{client.projects.length} Total</Badge>
              </CardHeader>
              <CardContent className="pt-4">
                {client.projects.length === 0 ? (
                  <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                    No projects found for this client. Create a project from Settings or Proposals.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {client.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div>
                          <Link href={`/${workspaceSlug}/projects/${project.id}`} className="text-xs font-semibold text-foreground underline-offset-4 hover:underline">
                            {project.name}
                          </Link>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(project.budget))} · Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                              <div className="h-full bg-brand" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{project.progress}%</span>
                          </div>
                          <Badge
                            className={cn(
                              'border px-2 py-0.5 text-[11px] font-medium',
                              project.status === 'ACTIVE' || project.status === 'COMPLETED'
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'border-border bg-secondary text-foreground'
                            )}
                            variant="secondary"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-border bg-card">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="font-heading text-sm font-bold text-foreground">Internal Notes</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Important business context, preferences, and background information</CardDescription>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap pt-4 text-xs leading-relaxed text-muted-foreground">
                {client.notes || 'No internal notes recorded for this client.'}
              </CardContent>
            </Card>
          </div>
        );

      case 'proposals':
        return (
          <Card className="overflow-hidden border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
              <div>
                <CardTitle className="font-heading text-sm font-bold text-foreground">Submitted Proposals</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Submitted estimates, bids, and scopes agreements</CardDescription>
              </div>
              <Badge variant="secondary" className="border border-border bg-secondary px-2 py-0.5 font-mono text-[11px]">{client.proposals.length} Total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {client.proposals.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                  No proposals found. Create a proposal for this client to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                        <th className="px-5 py-3">Number</th>
                        <th className="px-5 py-3">Proposal Title</th>
                        <th className="px-5 py-3">Total Cost</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {client.proposals.map((proposal) => (
                        <tr key={proposal.id} className="transition-colors hover:bg-secondary/40">
                          <td className="px-5 py-3 font-mono text-xs font-semibold text-muted-foreground">
                            {proposal.proposalNumber}
                          </td>
                          <td className="px-5 py-3 font-semibold text-foreground">
                            {proposal.title}
                          </td>
                          <td className="px-5 py-3 font-mono font-bold tabular-nums text-foreground">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency }).format(Number(proposal.totalAmount))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              className={cn(
                                'border px-2 py-0.5 text-[11px] font-medium',
                                proposal.status === 'APPROVED'
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : proposal.status === 'SENT'
                                    ? 'border-border bg-secondary text-foreground'
                                    : proposal.status === 'REJECTED'
                                      ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'
                                      : 'border-border bg-secondary text-muted-foreground'
                              )}
                              variant="secondary"
                            >
                              {proposal.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {new Date(proposal.expiresAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'invoices':
        return (
          <Card className="overflow-hidden border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
              <div>
                <CardTitle className="font-heading text-sm font-bold text-foreground">Billing & Invoices</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Billing history, balances, and payment records</CardDescription>
              </div>
              <Badge variant="secondary" className="border border-border bg-secondary px-2 py-0.5 font-mono text-[11px]">{client.invoices.length} Total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                  No billing records found. You can generate invoices inside the Invoice section.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                        <th className="px-5 py-3">Invoice Number</th>
                        <th className="px-5 py-3">Total Amount</th>
                        <th className="px-5 py-3">Payment Status</th>
                        <th className="px-5 py-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {client.invoices.map((invoice) => (
                        <tr key={invoice.id} className="transition-colors hover:bg-secondary/40">
                          <td className="px-5 py-3 font-mono text-xs font-semibold text-muted-foreground">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-5 py-3 font-mono font-bold tabular-nums text-foreground">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(Number(invoice.totalAmount))}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              className={cn(
                                'border px-2 py-0.5 text-[11px] font-medium',
                                invoice.status === 'PAID'
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : invoice.status === 'OVERDUE'
                                    ? 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400'
                                    : 'border-border bg-secondary text-foreground'
                              )}
                              variant="secondary"
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'files':
        return (
          <Card className="overflow-hidden border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
              <div>
                <CardTitle className="font-heading text-sm font-bold text-foreground">Workspace Materials</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Aggregated scope files, assets, and design sheets uploaded under this client</CardDescription>
              </div>
              <Badge variant="secondary" className="border border-border bg-secondary px-2 py-0.5 font-mono text-[11px]">{files.length} Files</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {files.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                  No files uploaded for this client&apos;s projects.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <div className="text-xs font-semibold text-foreground">{file.fileName}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {file.fileType.toUpperCase()} · {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link href={`/${workspaceSlug}/clients`} className="inline-flex min-h-6 shrink-0 items-center transition-colors hover:text-foreground">
          Clients
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate font-semibold text-foreground">{client.companyName}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-1">
          <Card className="overflow-hidden border border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[6px] bg-foreground font-heading text-sm font-bold text-background">
                {client.companyName.substring(0, 2).toUpperCase()}
              </div>
              <CardTitle className="break-words font-heading text-base font-bold text-foreground">{client.companyName}</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Client directory entry since {new Date(client.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-xs font-medium">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{client.primaryEmail}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{client.phone}</span>
                </div>
              )}
              <div className="pt-1">
                <Badge
                  className={cn(
                    'border px-2 py-0.5 text-[11px] font-medium',
                    client.archived
                      ? 'border-border bg-secondary text-muted-foreground'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  )}
                  variant="secondary"
                >
                  {client.archived ? 'Archived Client' : 'Active Workspace Client'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border pb-3">
              <div>
                <CardTitle className="font-heading text-xs font-bold text-foreground">Client Portal Keys</CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">Access accounts for client representatives</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                title="Invite Portal User"
                onClick={() => setIsInviteOpen(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {portalUsers.length === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-muted-foreground">
                  No portal users configured yet.
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInviteOpen(true)}
                    className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 text-xs font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-brand" />
                    <span>Invite Client Rep</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {portalUsers.map((portalUser) => {
                    const isActive = portalUser.user.hasPassword;
                    return (
                      <div key={portalUser.id} className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-2.5 text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="truncate font-semibold text-foreground">{portalUser.user.email}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{portalUser.title}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          {isActive ? (
                            <Badge variant="default" className="flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Invited</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6 lg:col-span-2">
          <div className="flex gap-1 overflow-x-auto rounded-md border border-border bg-secondary p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'overview'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={cn(
                'flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'proposals'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Proposals</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={cn(
                'flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'invoices'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={cn(
                'flex items-center gap-2 rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
                activeTab === 'files'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span>Files</span>
            </button>
          </div>

          {renderTabContent()}
        </div>
      </div>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="rounded-lg border border-border bg-popover p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <UserPlus className="h-4 w-4 text-brand" />
              <span>Invite Portal User</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide contact credentials for client representatives. An invitation will allow them to login securely to their client portal.
            </DialogDescription>
          </DialogHeader>

          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4 pt-2">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Representative Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="representative@nusantara.id" className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Job Title / Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Project Manager, CEO, Tech Lead" className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Inviting...' : 'Send Portal Invite'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
