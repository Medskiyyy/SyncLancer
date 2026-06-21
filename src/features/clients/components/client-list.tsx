'use client';

import React, { useState, useEffect } from 'react';
import { Client, Project } from '@prisma/client';
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

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-55">Clients Directory</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage workspace customer relations, scope history, and portal keys.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer font-semibold text-xs h-9">
          <Plus className="mr-1.5 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
              activeTab === 'active'
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            Active Clients
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
              activeTab === 'archived'
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <Input
            placeholder="Search company, contact, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900 text-xs h-9 rounded-lg"
          />
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-zinc-200/60 dark:border-zinc-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-950 text-zinc-400 mb-4 border border-zinc-200/50 dark:border-zinc-800/80">
            <Users className="h-6 w-6 text-zinc-400" />
          </div>
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            {searchQuery ? 'No matching clients found' : `No ${activeTab} clients yet`}
          </CardTitle>
          <CardDescription className="max-w-sm mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {searchQuery 
              ? 'Try refining your search terms or filters.'
              : activeTab === 'active' 
                ? 'Add your first client to start sending proposals, managing projects, and billing.' 
                : 'You have no archived clients.'
            }
          </CardDescription>
          {!searchQuery && activeTab === 'active' && (
            <Button onClick={() => setIsAddOpen(true)} className="mt-4 flex items-center gap-2 cursor-pointer font-semibold text-xs h-9">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="px-5 py-3">Client & Company</th>
                  <th className="px-5 py-3">Primary Contact</th>
                  <th className="px-5 py-3">Active Projects</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900">
                {filteredClients.map((client) => {
                  const projectCount = client.projects?.length || 0;
                  return (
                    <tr key={client.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/15 shadow-xs">
                            {client.companyName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/${workspaceSlug}/clients/${client.id}`} className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors hover:underline">
                              {client.companyName}
                            </Link>
                            {client.notes && (
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate max-w-[200px] mt-0.5 font-medium">
                                {client.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{client.primaryEmail}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 text-[10px]">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="font-mono font-semibold text-[10px] border border-zinc-200/50 dark:border-zinc-800/80">
                            <FolderKanban className="h-3 w-3 mr-1 text-zinc-400" />
                            {projectCount} {projectCount === 1 ? 'Project' : 'Projects'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge 
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5",
                            client.archived 
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30"
                              : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15"
                          )}
                          variant="secondary"
                        >
                          {client.archived ? 'Archived' : 'Active'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/${workspaceSlug}/clients/${client.id}`}>
                            <Button variant="ghost" size="icon" title="View Profile" className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                              <Eye className="h-3.5 w-3.5" />
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
                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title={client.archived ? 'Restore Client' : 'Archive Client'} 
                            onClick={() => handleArchiveClient(client)}
                            className="h-7 w-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                          >
                            {client.archived ? <RotateCcw className="h-3.5 w-3.5 text-amber-500" /> : <Archive className="h-3.5 w-3.5" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Client" 
                            onClick={() => handleDeleteClient(client.id)}
                            className="h-7 w-7 text-zinc-400 hover:bg-destructive/5 hover:text-destructive cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
