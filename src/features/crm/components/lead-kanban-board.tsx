'use client';

import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@prisma/client';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import {
  createLeadAction,
  updateLeadAction,
  updateLeadStatusAction,
  deleteLeadAction,
  convertLeadToClientAction,
} from '../actions/lead-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLeadSchema, CreateLeadInput, updateLeadSchema } from '../schemas/lead';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ArrowRightLeft, User, Phone, Briefcase, Mail } from 'lucide-react';

interface LeadKanbanBoardProps {
  initialLeads: Lead[];
  workspaceId: string;
}

const COLUMNS: { label: string; status: LeadStatus; color: string }[] = [
  { label: 'New Lead', status: LeadStatus.NEW, color: 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { label: 'Contacted', status: LeadStatus.CONTACTED, color: 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/50' },
  { label: 'Proposal Sent', status: LeadStatus.PROPOSAL_SENT, color: 'bg-purple-50/50 dark:bg-purple-950/10 border-purple-100 dark:border-purple-900/50' },
  { label: 'Negotiation', status: LeadStatus.NEGOTIATION, color: 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/50' },
  { label: 'Won', status: LeadStatus.WON, color: 'bg-green-50/50 dark:bg-green-950/10 border-green-100 dark:border-green-900/50' },
  { label: 'Lost', status: LeadStatus.LOST, color: 'bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/50' },
];

export function LeadKanbanBoard({ initialLeads, workspaceId }: LeadKanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent SSR Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const addForm = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      notes: '',
    },
  });

  const editForm = useForm<CreateLeadInput>({
    resolver: zodResolver(createLeadSchema),
  });

  useEffect(() => {
    if (editingLead) {
      editForm.reset({
        name: editingLead.name,
        email: editingLead.email,
        company: editingLead.company,
        phone: editingLead.phone,
        notes: editingLead.notes || '',
      });
    }
  }, [editingLead, editForm]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as LeadStatus;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    // Optimistic UI update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus, updatedAt: new Date() } : l)),
    );

    try {
      const result = await updateLeadStatusAction(leadId, workspaceId, newStatus);
      if (!result.success) {
        setLeads(previousLeads);
        toast.error(result.error || 'Failed to update lead status');
      } else {
        toast.success(`Lead moved to ${newStatus}`);
      }
    } catch (err) {
      setLeads(previousLeads);
      toast.error('An error occurred');
    }
  };

  const handleAddLead = async (data: CreateLeadInput) => {
    setIsLoading(true);
    try {
      const result = await createLeadAction(workspaceId, data);
      if (result.success && result.data) {
        toast.success('Lead created successfully');
        setIsAddOpen(false);
        addForm.reset();
      } else {
        toast.error(result.error || 'Failed to create lead');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLead = async (data: CreateLeadInput) => {
    if (!editingLead) return;
    setIsLoading(true);
    try {
      const result = await updateLeadAction(editingLead.id, workspaceId, data);
      if (result.success && result.data) {
        toast.success('Lead updated successfully');
        setIsEditOpen(false);
        setEditingLead(null);
      } else {
        toast.error(result.error || 'Failed to update lead');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const result = await deleteLeadAction(leadId, workspaceId);
      if (result.success) {
        toast.success('Lead deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete lead');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const handleConvertToClient = async (leadId: string) => {
    try {
      const result = await convertLeadToClientAction(leadId, workspaceId);
      if (result.success) {
        toast.success('Lead successfully converted to Active Client!');
      } else {
        toast.error(result.error || 'Failed to convert lead to client');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">CRM Leads</h1>
          <p className="text-sm text-muted-foreground">Manage your client acquisition pipeline</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </div>

      {/* Kanban Pipeline */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnLeads = leads.filter((l) => l.status === col.status);
            return (
              <div
                key={col.status}
                id={col.status}
                // We use drop ref element directly
                className={`flex flex-col rounded-xl border p-3 min-h-[500px] w-full ${col.color}`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{col.label}</span>
                  <Badge variant="secondary" className="rounded-full">
                    {columnLeads.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="group relative rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-grab active:cursor-grabbing transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{lead.name}</h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                              onClick={() => {
                                setEditingLead(lead);
                                setIsEditOpen(true);
                              }}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span className="truncate">{lead.company}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>

                        {lead.status === LeadStatus.WON && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full mt-2 text-xs font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            onClick={() => handleConvertToClient(lead.id)}
                          >
                            <ArrowRightLeft className="mr-1.5 h-3 w-3" />
                            Convert to Client
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* Dialog Add Lead */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>Create a lead in your CRM pipeline</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddLead)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Potential web development project..." disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Lead'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Lead */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>Update lead details</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLead)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+62xxxxxxxx" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Potential web development project..." disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
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
