'use client';

import React, { useState } from 'react';
import { Client, Project, Proposal, Invoice, ClientUser, User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  Building, 
  Mail, 
  Phone, 
  FolderKanban, 
  FileText, 
  Receipt, 
  FolderOpen, 
  Send, 
  Plus, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  ChevronRight
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

interface ExtendedClientUser extends ClientUser {
  user: User;
}

interface ClientProfileProps {
  client: Client & {
    projects: Project[];
    proposals: Proposal[];
    invoices: Invoice[];
    portalUsers: ExtendedClientUser[];
  };
  files: any[];
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
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Render tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Active Projects */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-bold">Projects</CardTitle>
                  <CardDescription>Active and completed scopes of work</CardDescription>
                </div>
                <Badge variant="outline">{client.projects.length} Total</Badge>
              </CardHeader>
              <CardContent>
                {client.projects.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                    No projects found for this client. Create a project from Settings or Proposals.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {client.projects.map((project) => (
                      <div key={project.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div>
                          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{project.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Budget: {new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency }).format(Number(project.budget))} &middot; Deadline: {new Date(project.deadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium">{project.progress}%</span>
                          </div>
                          <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes & Description */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Internal Notes</CardTitle>
                <CardDescription>Important business context and background information</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {client.notes || 'No internal notes recorded for this client.'}
              </CardContent>
            </Card>
          </div>
        );

      case 'proposals':
        return (
          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold">Proposals</CardTitle>
                <CardDescription>Submitted cost estimates and contracts</CardDescription>
              </div>
              <Badge variant="outline">{client.proposals.length} Total</Badge>
            </CardHeader>
            <CardContent>
              {client.proposals.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                  No proposals found. Let's create your first proposal for this client.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                        <th className="pb-3">Number</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {client.proposals.map((proposal) => (
                        <tr key={proposal.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 font-mono text-xs">{proposal.proposalNumber}</td>
                          <td className="py-3.5 font-medium">{proposal.title}</td>
                          <td className="py-3.5 font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.currency }).format(Number(proposal.totalAmount))}
                          </td>
                          <td className="py-3.5">
                            <Badge variant={
                              proposal.status === 'APPROVED' ? 'default' :
                              proposal.status === 'SENT' ? 'secondary' :
                              proposal.status === 'REJECTED' ? 'destructive' : 'outline'
                            }>
                              {proposal.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-zinc-500">{new Date(proposal.expiresAt).toLocaleDateString()}</td>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold">Invoices</CardTitle>
                <CardDescription>Billing history and outstanding payments</CardDescription>
              </div>
              <Badge variant="outline">{client.invoices.length} Total</Badge>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                  No billing records found. You can generate invoices inside the Invoice section.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-500 uppercase">
                        <th className="pb-3">Number</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {client.invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="py-3.5 font-mono text-xs">{invoice.invoiceNumber}</td>
                          <td className="py-3.5 font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(Number(invoice.totalAmount))}
                          </td>
                          <td className="py-3.5">
                            <Badge variant={
                              invoice.status === 'PAID' ? 'default' :
                              invoice.status === 'OVERDUE' ? 'destructive' :
                              invoice.status === 'SENT' ? 'secondary' : 'outline'
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-zinc-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
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
          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-bold">Client Files</CardTitle>
                <CardDescription>Aggregated documents and media uploaded under client projects</CardDescription>
              </div>
              <Badge variant="outline">{files.length} Files</Badge>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 text-sm">
                  No files uploaded for this client's projects.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {files.map((file) => (
                    <div key={file.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-zinc-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{file.fileName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {file.fileType.toUpperCase()} &middot; {new Intl.NumberFormat('en', { notation: 'compact', style: 'unit', unit: 'byte' }).format(Number(file.fileSize))}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-400">
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
      {/* Breadcrumbs & Back Button */}
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href={`/${workspaceSlug}/clients`} className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
          Clients
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        <span className="text-zinc-900 dark:text-zinc-50 font-medium truncate">{client.companyName}</span>
      </div>

      {/* Main Profile Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Client Info Card & Portal Members */}
        <div className="space-y-6 lg:col-span-1">
          {/* Main Info Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <Building className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">{client.companyName}</CardTitle>
              <CardDescription className="text-xs">
                Member since {new Date(client.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 truncate">{client.primaryEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300">{client.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={client.archived ? 'secondary' : 'default'}>
                  {client.archived ? 'Archived' : 'Active Client'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Portal User Invitation / List */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Client Portal Users</CardTitle>
                <CardDescription className="text-xs">Representatives with secure dashboard access</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                title="Invite Portal User"
                onClick={() => setIsInviteOpen(true)}
                className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <UserPlus className="h-4 w-4 text-primary" />
              </Button>
            </CardHeader>
            <CardContent>
              {portalUsers.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 dark:text-zinc-400 text-xs">
                  No secure portal users set up yet. Invite one below.
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsInviteOpen(true)} 
                    className="w-full mt-3 flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Invite Client Rep</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {portalUsers.map((portalUser) => {
                    const isActive = !!portalUser.user.passwordHash;
                    return (
                      <div key={portalUser.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{portalUser.user.email}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{portalUser.title}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {isActive ? (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0.5 bg-green-600 hover:bg-green-600 flex items-center gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5" />
                              <span>Active</span>
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
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

        {/* Right Side: Navigation Tabs & Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation Menu */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary text-zinc-950 dark:text-zinc-50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('proposals')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'proposals'
                  ? 'border-primary text-zinc-950 dark:text-zinc-50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Proposals</span>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'invoices'
                  ? 'border-primary text-zinc-950 dark:text-zinc-50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span>Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'files'
                  ? 'border-primary text-zinc-950 dark:text-zinc-50'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Files</span>
            </button>
          </div>

          {/* Actual Tab Card content rendering */}
          {renderTabContent()}
        </div>
      </div>

      {/* Invite Client User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Portal User</DialogTitle>
            <DialogDescription>
              Provide contact credentials for client representatives. An invitation will allow them to login securely to their own branded client portal.
            </DialogDescription>
          </DialogHeader>

          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representative Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="representative@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={inviteForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title / Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Project Manager / Tech Lead / Account Owner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
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
