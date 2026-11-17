'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Client, Project, Invoice } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Archive, 
  Trash2, 
  Edit, 
  Eye, 
  RotateCcw,
  Users,
  Building,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

import { createClientSchema, CreateClientInput } from '../schemas/client';
import { 
  createClientAction, 
  updateClientAction, 
  archiveClientAction, 
  deleteClientAction 
} from '../actions/client-actions';
import { cn } from '@/lib/utils';

interface ExtendedClient extends Client {
  projects?: Project[];
  invoices?: Invoice[];
}

interface ClientListProps {
  initialClients: ExtendedClient[];
  workspaceId: string;
  workspaceSlug: string;
}

export function ClientList({ initialClients, workspaceId, workspaceSlug }: ClientListProps) {
  const searchParams = useSearchParams();
  const shouldAutoOpenAdd = searchParams.get('add') === 'true';
  const [prevAddParam, setPrevAddParam] = useState(shouldAutoOpenAdd);
  const [clients, setClients] = useState<ExtendedClient[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  
  const [isAddOpen, setIsAddOpen] = useState(shouldAutoOpenAdd);
  const [editingClient, setEditingClient] = useState<ExtendedClient | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (shouldAutoOpenAdd !== prevAddParam) {
    setPrevAddParam(shouldAutoOpenAdd);
    if (shouldAutoOpenAdd) {
      setIsAddOpen(true);
    }
  }

  // Re-sync when the server sends a fresh list (router.refresh()). Done during
  // render rather than in an effect so there is no extra commit with stale rows.
  const [syncedClients, setSyncedClients] = useState(initialClients);
  if (initialClients !== syncedClients) {
    setSyncedClients(initialClients);
    setClients(initialClients);
  }

  const addForm = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      companyName: '',
      primaryEmail: '',
      phone: '',
      notes: '',
    },
  });

  const editForm = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      companyName: '',
      primaryEmail: '',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingClient) {
      editForm.reset({
        companyName: editingClient.companyName,
        primaryEmail: editingClient.primaryEmail,
        phone: editingClient.phone,
        notes: editingClient.notes || '',
      });
    }
  }, [editingClient, editForm]);

  const handleCreateClient = async (data: CreateClientInput) => {
    setIsLoading(true);
    try {
      const result = await createClientAction(workspaceId, data);
      if (result.success && result.data) {
        toast.success('Client added successfully');
        setIsAddOpen(false);
        addForm.reset();
      } else {
        toast.error(result.error || 'Failed to create client');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async (data: CreateClientInput) => {
    if (!editingClient) return;
    setIsLoading(true);
    try {
      const result = await updateClientAction(editingClient.id, workspaceId, data);
      if (result.success && result.data) {
        toast.success('Client details updated');
        setIsEditOpen(false);
        setEditingClient(null);
      } else {
        toast.error(result.error || 'Failed to update client');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveClient = async (client: ExtendedClient) => {
    const actionText = client.archived ? 'restore' : 'archive';
    if (!confirm(`Are you sure you want to ${actionText} this client?`)) return;

    try {
      const result = await archiveClientAction(client.id, workspaceId, !client.archived);
      if (result.success) {
        toast.success(`Client ${client.archived ? 'restored' : 'archived'} successfully`);
      } else {
        toast.error(result.error || `Failed to ${actionText} client`);
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to permanently delete this client? All projects and invoices under this client will be affected.')) return;

    try {
      const result = await deleteClientAction(clientId, workspaceId);
      if (result.success) {
        toast.success('Client permanently deleted');
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  const filteredClients = clients.filter((client) => {
    const isArchivedMatch = activeTab === 'archived' ? client.archived : !client.archived;
    
    if (!isArchivedMatch) return false;

    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      client.companyName.toLowerCase().includes(query) ||
      client.primaryEmail.toLowerCase().includes(query) ||
      (client.phone && client.phone.toLowerCase().includes(query)) ||
      (client.notes && client.notes.toLowerCase().includes(query))
    );
  });

  const getClientRevenue = (client: ExtendedClient) => {
    if (!client.invoices) return 0;
    return client.invoices
      .filter((invoice) => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
  };

  const getClientLastActivity = (client: ExtendedClient) => {
    const dates = [new Date(client.updatedAt)];
    if (client.projects) {
      client.projects.forEach((p) => dates.push(new Date(p.updatedAt)));
    }
    if (client.invoices) {
      client.invoices.forEach((i) => dates.push(new Date(i.updatedAt)));
    }
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    return maxDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage client profiles, project history, billing records, and portal access.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="shrink-0 self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex self-start rounded-md border border-border bg-secondary p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              'rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
              activeTab === 'active'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Active Clients
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              'rounded-[4px] px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
              activeTab === 'archived'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-border bg-secondary/40 p-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
            <Users className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <CardTitle className="font-heading text-base font-bold text-foreground">
            {searchQuery ? 'No matching clients found' : `No ${activeTab} clients yet`}
          </CardTitle>
          <CardDescription className="mt-2 max-w-sm text-sm text-muted-foreground">
            {searchQuery
              ? 'Try refining your search terms or filters.'
              : activeTab === 'active'
                ? 'Create a client profile to start tracking proposals, active projects, and billing.'
                : 'You have no archived clients.'}
          </CardDescription>
          {!searchQuery && activeTab === 'active' && (
            <Button onClick={() => setIsAddOpen(true)} className="mt-5 gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="h-11 border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                  <th className="px-6 align-middle">Client</th>
                  <th className="px-6 align-middle">Email</th>
                  <th className="px-6 align-middle">Projects</th>
                  <th className="px-6 align-middle">Revenue</th>
                  <th className="px-6 align-middle">Status</th>
                  <th className="px-6 align-middle">Last Activity</th>
                  <th className="px-6 text-right align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-transparent">
                {filteredClients.map((client) => {
                  const projectCount = client.projects?.length || 0;
                  const revenue = getClientRevenue(client);
                  const lastActivity = getClientLastActivity(client);
                  return (
                    <tr key={client.id} className="h-[58px] transition-colors hover:bg-secondary/40">
                      <td className="px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-foreground font-heading text-xs font-bold text-background">
                            {client.companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <Link href={`/${workspaceSlug}/clients/${client.id}`} className="inline-flex min-h-6 items-center truncate font-semibold text-foreground underline-offset-4 hover:underline">
                              {client.companyName}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 align-middle text-muted-foreground">
                        <a href={`mailto:${client.primaryEmail}`} className="inline-flex min-h-6 items-center hover:text-foreground hover:underline">
                          {client.primaryEmail}
                        </a>
                      </td>
                      <td className="px-6 align-middle">
                        <span className="font-medium text-foreground">
                          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                        </span>
                      </td>
                      <td className="px-6 align-middle font-mono font-semibold tabular-nums text-foreground">
                        ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge
                          className={cn(
                            'rounded-[5px] border px-2 py-0.5 text-[11px] font-medium shadow-none',
                            client.archived
                              ? 'border-border bg-secondary text-muted-foreground'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          )}
                          variant="secondary"
                        >
                          {client.archived ? 'Archived' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 align-middle text-xs text-muted-foreground">
                        {lastActivity}
                      </td>
                      <td className="px-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/clients/${client.id}`}>
                            <Button variant="ghost" size="icon" title="View Profile" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit Client"
                            onClick={() => {
                              setEditingClient(client);
                              setIsEditOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={client.archived ? 'Restore Client' : 'Archive Client'}
                            onClick={() => handleArchiveClient(client)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            {client.archived ? <RotateCcw className="h-4 w-4 text-amber-500" /> : <Archive className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Client"
                            onClick={() => handleDeleteClient(client.id)}
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

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-lg border border-border bg-popover p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Building className="h-4 w-4 text-brand" />
              <span>Add Client</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add the client contact details used for projects, proposals, invoices, and portal access.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateClient)} className="space-y-4 pt-2">
              <FormField
                control={addForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nusantara Retail" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@nusantara.id" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the client sector, core business..." disabled={isLoading} className="min-h-[80px] resize-none text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-lg border border-border bg-popover p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Building className="h-4 w-4 text-brand" />
              <span>Modify Client Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update general settings and internal records for this client account.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateClient)} className="space-y-4 pt-2">
              <FormField
                control={editForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Nusantara Retail" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@nusantara.id" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the client sector, core business..." disabled={isLoading} className="min-h-[80px] resize-none text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
