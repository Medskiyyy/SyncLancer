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
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  createLeadAction,
  updateLeadAction,
  updateLeadStatusAction,
  deleteLeadAction,
  convertLeadToClientAction,
} from '../actions/lead-actions';
import { Card, CardContent } from '@/components/ui/card';
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
import { createLeadSchema, CreateLeadInput } from '../schemas/lead';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, ArrowRightLeft, User, Phone, Briefcase, Mail, GripVertical, Sparkles, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/motion';

interface LeadKanbanBoardProps {
  initialLeads: Lead[];
  workspaceId: string;
}

const COLUMNS = [
  { label: 'Lead', status: LeadStatus.NEW, theme: 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/10' },
  { label: 'Contacted', status: LeadStatus.CONTACTED, theme: 'border-blue-200/40 dark:border-blue-900/10 bg-blue-500/3 dark:bg-blue-950/5' },
  { label: 'Proposal Sent', status: LeadStatus.PROPOSAL_SENT, theme: 'border-violet-200/40 dark:border-violet-900/10 bg-violet-500/3 dark:bg-violet-955/5' },
  { label: 'Negotiation', status: LeadStatus.NEGOTIATION, theme: 'border-amber-200/40 dark:border-amber-900/10 bg-amber-500/3 dark:bg-amber-955/5' },
  { label: 'Won', status: LeadStatus.WON, theme: 'border-green-200/40 dark:border-green-900/10 bg-green-500/3 dark:bg-green-955/5' },
  { label: 'Lost', status: LeadStatus.LOST, theme: 'border-red-200/40 dark:border-red-900/10 bg-red-500/3 dark:bg-red-955/5' },
];

// Droppable Column Component
function KanbanColumn({ id, title, leadsCount, children, theme }: any) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border p-3 min-h-[550px] w-[280px] shrink-0 transition-all duration-200",
        theme,
        isOver ? "ring-2 ring-primary/20 border-primary/40 bg-zinc-100/50 dark:bg-zinc-800/20" : ""
      )}
    >
      <div className="flex items-center justify-between mb-3.5 px-1.5">
        <span className="font-bold text-xs text-zinc-950 dark:text-zinc-100 tracking-wide uppercase">{title}</span>
        <Badge variant="secondary" className="rounded-full font-mono text-[10px] px-2 py-0.5 border border-zinc-200/50 dark:border-zinc-850">
          {leadsCount}
        </Badge>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[480px]">
        {children}
      </div>
    </div>
  );
}

// Draggable Lead Card Component
function KanbanCard({ lead, onEdit, onDelete, onConvert }: any) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-zinc-200/60 bg-white p-3.5 shadow-xs hover-lift dark:border-zinc-850 dark:bg-zinc-900/60 transition-all",
        isDragging ? "cursor-grabbing shadow-premium-lg scale-[1.02] border-primary/30" : "cursor-grab"
      )}
    >
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Drag Handle */}
            <div 
              {...listeners} 
              {...attributes} 
              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0" />
            </div>
            <h4 className="font-bold text-xs text-zinc-850 dark:text-zinc-150 truncate leading-none">
              {lead.name}
            </h4>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(lead);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-destructive hover:bg-destructive/5 hover:text-destructive cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Lead Details */}
        <div className="space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          {lead.company && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
              <span className="truncate font-medium">{lead.company}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-zinc-400" />
              <span className="truncate font-medium">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-medium">{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Notes Preview (if any) */}
        {lead.notes && (
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-100 dark:border-zinc-800/80 pt-2 line-clamp-2">
            {lead.notes}
          </p>
        )}

        {/* Convert CTA */}
        {lead.status === LeadStatus.WON && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-2 text-[10px] font-bold bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-550/15 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onConvert(lead.id);
            }}
          >
            <ArrowRightLeft className="mr-1.5 h-3 w-3" />
            Convert to Client
          </Button>
        )}
      </div>
    </div>
  );
}

export function LeadKanbanBoard({ initialLeads, workspaceId }: LeadKanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter leads by search query
  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower))
    );
  });

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      {/* Board Header with Animation */}
      <FadeIn direction="up" delay={0.02} duration={0.35}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-heading">CRM Leads</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Track and manage your client pipeline stages interactively.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search bar inside header */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-48 sm:w-56 rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <Button onClick={() => setIsAddOpen(true)} className="cursor-pointer font-semibold text-xs h-9">
              <Plus className="mr-1.5 h-4 w-4" /> Add Lead
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Kanban Pipeline */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 w-full">
          {COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                id={col.status}
                title={col.label}
                leadsCount={columnLeads.length}
                theme={col.theme}
              >
                {columnLeads.map((lead) => (
                  <KanbanCard
                    key={lead.id}
                    lead={lead}
                    onEdit={(l: Lead) => {
                      setEditingLead(l);
                      setIsEditOpen(true);
                    }}
                    onDelete={handleDeleteLead}
                    onConvert={handleConvertToClient}
                  />
                ))}
                {columnLeads.length === 0 && (
                  <div className="flex h-32 items-center justify-center border border-dashed border-zinc-200/40 dark:border-zinc-800/40 rounded-lg text-[10px] text-zinc-400 dark:text-zinc-550 font-medium">
                    No leads here
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      {/* Dialog Add Lead */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Add New Lead</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-500 text-xs">
              Add a contact to the pipeline. They will be placed in the &apos;New Lead&apos; stage.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddLead)} className="space-y-4 pt-2">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the deal, value, or timeline..." disabled={isLoading} className="text-xs min-h-[80px] rounded-lg resize-none" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading} className="cursor-pointer text-xs h-9 font-semibold">
                  {isLoading ? 'Creating...' : 'Create Lead'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Lead */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-primary" />
              <span>Edit Lead Details</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 dark:text-zinc-500 text-xs">
              Modify the contact details and info for this active pipeline lead.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditLead)} className="space-y-4 pt-2">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" disabled={isLoading} className="text-xs h-9 rounded-lg" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-350">Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the deal, value, or timeline..." disabled={isLoading} className="text-xs min-h-[80px] rounded-lg resize-none" {...field} />
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
