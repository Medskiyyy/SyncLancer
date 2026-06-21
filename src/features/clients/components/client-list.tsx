'use client';

import React, { useState, useEffect } from 'react';
import { Client, Project, Invoice } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  FolderKanban, 
  Archive, 
  Trash2, 
  Edit, 
  Eye, 
  RotateCcw,
  Users,
  Building,
  Sparkles,
  DollarSign,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [clients, setClients] = useState<ExtendedClient[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ExtendedClient | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage client profiles, projects, billing records, and access keys.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer font-medium text-sm h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50 self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
              activeTab === 'active'
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Active Clients
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
              activeTab === 'archived'
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white text-sm h-10 rounded-lg border-slate-250"
          />
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-slate-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-450 mb-4 border border-slate-100">
            <Users className="h-6 w-6 text-slate-500" />
          </div>
          <CardTitle className="text-base font-bold text-slate-900">
            {searchQuery ? 'No matching clients found' : `No ${activeTab} clients yet`}
          </CardTitle>
          <CardDescription className="max-w-sm mt-2 text-sm text-slate-500">
            {searchQuery 
              ? 'Try refining your search terms or filters.'
              : activeTab === 'active' 
                ? 'Create a client profile to start tracking proposals, active projects, and billing.' 
                : 'You have no archived clients.'
            }
          </CardDescription>
          {!searchQuery && activeTab === 'active' && (
            <Button onClick={() => setIsAddOpen(true)} className="mt-5 flex items-center gap-2 cursor-pointer font-medium text-sm h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg shadow-sm">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-slate-200 rounded-xl shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/50 h-[48px]">
                  <th className="px-6 align-middle font-medium">Client</th>
                  <th className="px-6 align-middle font-medium">Email</th>
                  <th className="px-6 align-middle font-medium">Projects</th>
                  <th className="px-6 align-middle font-medium">Revenue</th>
                  <th className="px-6 align-middle font-medium">Status</th>
                  <th className="px-6 align-middle font-medium">Last Activity</th>
                  <th className="px-6 align-middle font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredClients.map((client) => {
                  const projectCount = client.projects?.length || 0;
                  const revenue = getClientRevenue(client);
                  const lastActivity = getClientLastActivity(client);
                  return (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors h-[60px]">
                      <td className="px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold border border-blue-100 text-xs">
                            {client.companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link href={`/${workspaceSlug}/clients/${client.id}`} className="font-semibold text-slate-900 hover:text-blue-600 hover:underline truncate">
                              {client.companyName}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 align-middle text-slate-600">
                        <a href={`mailto:${client.primaryEmail}`} className="hover:underline hover:text-blue-600">
                          {client.primaryEmail}
                        </a>
                      </td>
                      <td className="px-6 align-middle">
                        <span className="font-medium text-slate-700">
                          {projectCount} {projectCount === 1 ? 'project' : 'projects'}
                        </span>
                      </td>
                      <td className="px-6 align-middle font-mono font-medium text-slate-900">
                        ${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge 
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full border shadow-none",
                            client.archived 
                              ? "bg-slate-105 text-slate-600 border-slate-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-150"
                          )}
                          variant="secondary"
                        >
                          {client.archived ? 'Archived' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-6 align-middle text-slate-500 text-xs">
                        {lastActivity}
                      </td>
                      <td className="px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/clients/${client.id}`}>
                            <Button variant="ghost" size="icon" title="View Profile" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer">
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
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title={client.archived ? 'Restore Client' : 'Archive Client'} 
                            onClick={() => handleArchiveClient(client)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md cursor-pointer"
                          >
                            {client.archived ? <RotateCcw className="h-4 w-4 text-amber-500" /> : <Archive className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Client" 
                            onClick={() => handleDeleteClient(client.id)}
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

      {/* Add Client Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Add Client</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-500 text-xs">
              Introduce a new corporate entity or client contact to your workspace directory.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateClient)} className="space-y-4 pt-2">
              <FormField
                control={addForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@acme.com" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the client sector, core business..." disabled={isLoading} className="text-xs min-h-[80px] rounded-lg resize-none" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="cursor-pointer text-xs h-9 font-semibold">
                  {isLoading ? 'Adding...' : 'Add Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              <span>Modify Client Details</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-500 text-xs">
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
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@acme.com" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the client sector, core business..." disabled={isLoading} className="text-xs min-h-[80px] rounded-lg resize-none" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="cursor-pointer text-xs h-9 font-semibold">
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
