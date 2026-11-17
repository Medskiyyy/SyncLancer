'use client';

import * as React from 'react';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Lead, LeadStatus } from '@prisma/client';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit2, Trash2, ArrowRightLeft, Phone, Briefcase, Mail, GripVertical, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadKanbanBoardProps {
  initialLeads: Lead[];
  workspaceId: string;
}

const COLUMNS = [
  { label: 'Lead', status: LeadStatus.NEW },
  { label: 'Contacted', status: LeadStatus.CONTACTED },
  { label: 'Proposal Sent', status: LeadStatus.PROPOSAL_SENT },
  { label: 'Negotiation', status: LeadStatus.NEGOTIATION },
  { label: 'Won', status: LeadStatus.WON, dot: 'bg-brand' },
  { label: 'Lost', status: LeadStatus.LOST, dot: 'bg-destructive' },
];

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  leadsCount: number;
  children: React.ReactNode;
  dot?: string;
}

interface KanbanCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onConvert: (leadId: string) => void;
}

function KanbanColumn({ id, title, leadsCount, children, dot }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[540px] w-[280px] shrink-0 flex-col rounded-lg border border-border bg-secondary/50 p-3 transition-colors duration-150',
        isOver ? 'border-foreground/40 bg-secondary' : ''
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
          {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />}
          <span>{title}</span>
        </span>
        <span className="rounded-[4px] border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
          {leadsCount}
        </span>
      </div>
      <div className="min-h-[470px] flex-1 space-y-2.5 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onEdit, onDelete, onConvert }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-md border border-border bg-card p-3 transition-colors hover:border-foreground/30',
        isDragging ? 'cursor-grabbing border-foreground/40 shadow-lg' : 'cursor-grab'
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <div
              {...listeners}
              {...attributes}
              className="cursor-grab rounded p-0.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-3.5 w-3.5 shrink-0" />
            </div>
            <h4 className="truncate text-xs font-semibold leading-none text-foreground">
              {lead.name}
            </h4>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
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
              className="h-6 w-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5 text-[11px] text-muted-foreground">
          {lead.company && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium">{lead.company}</span>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-medium">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium">{lead.phone}</span>
            </div>
          )}
        </div>

        {lead.notes && (
          <p className="line-clamp-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {lead.notes}
          </p>
        )}

        {lead.status === LeadStatus.WON && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full border-emerald-500/25 bg-emerald-500/10 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 cursor-pointer"
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

const subscribeNoop = () => () => {};

export function LeadKanbanBoard({ initialLeads, workspaceId }: LeadKanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  // dnd-kit must not render during SSR. useSyncExternalStore reports false on the
  // server and true on the client without a setState-in-effect round trip.
  const isMounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Re-sync when the server sends a fresh list (router.refresh()). Done during
  // render rather than in an effect so there is no extra commit with stale cards.
  const [syncedLeads, setSyncedLeads] = useState(initialLeads);
  if (initialLeads !== syncedLeads) {
    setSyncedLeads(initialLeads);
    setLeads(initialLeads);
  }

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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
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
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">CRM Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track prospects and convert closed deals into clients.</p>
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-8 text-xs sm:w-56"
            />
          </div>

          <Button onClick={() => setIsAddOpen(true)} className="shrink-0">
            <Plus className="mr-1.5 h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
        <div className="flex w-full gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnLeads = filteredLeads.filter((l) => l.status === col.status);
            return (
              <KanbanColumn
                key={col.status}
                id={col.status}
                title={col.label}
                leadsCount={columnLeads.length}
                dot={col.dot}
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
                  <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                    No leads here
                  </div>
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-lg border border-border bg-popover p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
              <Plus className="h-4 w-4 text-brand" />
              <span>Add New Lead</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a contact to the pipeline. New leads start in the Lead stage.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddLead)} className="space-y-4 pt-2">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Raka Pratama" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="raka@studio.id" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="company"
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
                    <FormLabel className="text-xs font-medium text-foreground">Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the deal, value, or timeline..." disabled={isLoading} className="min-h-[80px] resize-none text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Lead'}
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
              <Edit2 className="h-4 w-4 text-brand" />
              <span>Edit Lead Details</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
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
                    <FormLabel className="text-xs font-medium text-foreground">Contact Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Raka Pratama" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="raka@studio.id" disabled={isLoading} className="text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="company"
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
                    <FormLabel className="text-xs font-medium text-foreground">Notes / Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the deal, value, or timeline..." disabled={isLoading} className="min-h-[80px] resize-none text-xs" {...field} />
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
