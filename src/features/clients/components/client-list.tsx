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
  X, 
  FileText, 
  RotateCcw,
  Users
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

import { createClientSchema, CreateClientInput, updateClientSchema, UpdateClientInput } from '../schemas/client';
import { 
  createClientAction, 
  updateClientAction, 
  archiveClientAction, 
  deleteClientAction 
} from '../actions/client-actions';

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
        toast.success('Client created successfully');
        setIsAddOpen(false);
        addForm.reset();
        // Optimistically add to list
        setClients(prev => [result.data as ExtendedClient, ...prev]);
      } else {
        toast.error(result.error || 'Failed to create client');
      }
    } catch (err) {
      toast.error('An error occurred');
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
        toast.success('Client updated successfully');
        setIsEditOpen(false);
        setEditingClient(null);
        // Update item in list
        setClients(prev => 
          prev.map(c => c.id === editingClient.id ? { ...c, ...result.data } : c)
        );
      } else {
        toast.error(result.error || 'Failed to update client');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveClient = async (client: ExtendedClient) => {
    const nextArchivedState = !client.archived;
    try {
      const result = await archiveClientAction(client.id, workspaceId, nextArchivedState);
      if (result.success) {
        toast.success(nextArchivedState ? 'Client archived' : 'Client restored');
        setClients(prev =>
          prev.map(c => c.id === client.id ? { ...c, archived: nextArchivedState } : c)
        );
      } else {
        toast.error(result.error || 'Failed to update archive status');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client? All portal integrations will be revoked.')) return;
    try {
      const result = await deleteClientAction(clientId, workspaceId);
      if (result.success) {
        toast.success('Client deleted successfully');
        setClients(prev => prev.filter(c => c.id !== clientId));
      } else {
        toast.error(result.error || 'Failed to delete client');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  // Filter clients based on search query and active tab
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'active' ? !client.archived : client.archived;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client relationships, project scopes, invoices, and client portals.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2 self-start sm:self-center">
          <Plus className="h-4 w-4" />
          <span>Add Client</span>
        </Button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-zinc-100 p-1 rounded-lg dark:bg-zinc-800 self-start">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-white shadow-sm text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            Active Clients
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'archived'
                ? 'bg-white shadow-sm text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50'
                : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50'
            }`}
          >
            Archived
          </button>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search company, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Clients Card List or Table */}
      {filteredClients.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {searchQuery ? 'No matching clients found' : `No ${activeTab} clients yet`}
          </CardTitle>
          <CardDescription className="max-w-sm mt-2 text-zinc-500 dark:text-zinc-400">
            {searchQuery 
              ? 'Try refining your search terms or filters.'
              : activeTab === 'active' 
                ? 'Add your first client to start sending proposals, managing projects, and billing.' 
                : 'You have no archived clients.'
            }
          </CardDescription>
          {!searchQuery && activeTab === 'active' && (
            <Button onClick={() => setIsAddOpen(true)} className="mt-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Client</span>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => {
            const projectCount = client.projects?.length || 0;
            return (
              <Card key={client.id} className="relative flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {client.archived && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                    ARCHIVED
                  </div>
                )}
                <div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                      {client.companyName}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[32px] text-xs">
                      {client.notes || 'No description or notes provided.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4 border-b border-zinc-100 dark:border-zinc-800 text-sm">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Mail className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{client.primaryEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Phone className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <FolderKanban className="h-4 w-4 text-zinc-400 shrink-0" />
                      <span>{projectCount} {projectCount === 1 ? 'Project' : 'Projects'}</span>
                    </div>
                  </CardContent>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex gap-1.5">
                    <Link href={`/${workspaceSlug}/clients/${client.id}`}>
                      <Button variant="ghost" size="icon" title="View Profile" className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
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
                      className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title={client.archived ? 'Restore Client' : 'Archive Client'} 
                      onClick={() => handleArchiveClient(client)}
                      className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {client.archived ? <RotateCcw className="h-4 w-4 text-amber-500" /> : <Archive className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Delete Client" 
                    onClick={() => handleDeleteClient(client.id)}
                    className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/20 text-zinc-600 dark:text-zinc-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>
              Create a new client entity. You can link active projects, generate invoices, and invite client representatives to their secure portal from here.
            </DialogDescription>
          </DialogHeader>

          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleCreateClient)} className="space-y-4">
              <FormField
                control={addForm.control as any}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control as any}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Key client details, industry, address, timezone, or billing cycle details..." 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Client'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open);
        if (!open) setEditingClient(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client company profile details and contacts.
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateClient)} className="space-y-4">
              <FormField
                control={editForm.control as any}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control as any}
                name="primaryEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="billing@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control as any}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control as any}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Key client details..." 
                        className="resize-none h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
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
