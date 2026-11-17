'use client';

import { getErrorMessage } from '@/lib/errors';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  CheckCircle, 
  Receipt, 
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Search,
  Filter
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FadeIn } from '@/components/ui/motion';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  createInvoiceAction, 
  deleteInvoiceAction, 
  sendInvoiceAction, 
  markAsPaidAction 
} from '../actions/invoice-actions';

interface MappedInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId: string | null;
  dueDate: Date;
  status: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: Date;
  client: { companyName: string; primaryEmail: string };
  project: { id: string; name: string } | null;
}

interface ClientOption {
  id: string;
  companyName: string;
}

interface ProjectOption {
  id: string;
  name: string;
  clientId: string;
}

interface WorkspaceInvoiceManagerProps {
  workspaceId: string;
  workspaceSlug: string;
  initialInvoices: MappedInvoice[];
  clients: ClientOption[];
  projects: ProjectOption[];
}

interface BuilderItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const toDateInputValue = (offsetDays: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-border bg-secondary text-foreground shadow-none',
  SENT: 'border-border bg-secondary text-foreground shadow-none',
  PAID: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-none',
  OVERDUE: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400 shadow-none',
  CANCELLED: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400 shadow-none',
};

export function WorkspaceInvoiceManager({ 
  workspaceId, 
  initialInvoices, 
  clients, 
  projects 
}: WorkspaceInvoiceManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoOpenCreate = searchParams.get('create') === 'true';
  const [prevCreateParam, setPrevCreateParam] = useState(shouldAutoOpenCreate);
  const invoices = initialInvoices;
  const [isCreateOpen, setIsCreateOpen] = useState(shouldAutoOpenCreate);
  const [isLoading, setIsLoading] = useState(false);

  if (shouldAutoOpenCreate !== prevCreateParam) {
    setPrevCreateParam(shouldAutoOpenCreate);
    if (shouldAutoOpenCreate) {
      setIsCreateOpen(true);
    }
  }

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('none');
  const [dueDate, setDueDate] = useState<string>(() => toDateInputValue(14));
  const [currency, setCurrency] = useState<string>('USD');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<BuilderItem[]>([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<MappedInvoice | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Filter projects by selected client
  const filteredProjects = selectedClientId 
    ? projects.filter(p => p.clientId === selectedClientId)
    : [];

  const handleAddItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof BuilderItem, value: string) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0;
    } else if (field === 'unitPrice') {
      newItems[index].unitPrice = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  // Calculations for running totals
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!selectedClientId) {
      toast.error('Please select a client.');
      return;
    }
    if (items.some(item => !item.name.trim())) {
      toast.error('All line items must have a name.');
      return;
    }
    if (items.some(item => item.quantity <= 0 || item.unitPrice < 0)) {
      toast.error('Quantities and unit prices must be positive.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await createInvoiceAction(workspaceId, {
        clientId: selectedClientId,
        projectId: selectedProjectId === 'none' ? undefined : selectedProjectId,
        dueDate: new Date(dueDate),
        currency,
        taxRate,
        items,
      });

      if (res.success) {
        toast.success('Invoice created successfully as DRAFT');
        setIsCreateOpen(false);
        setItems([{ name: '', description: '', quantity: 1, unitPrice: 0 }]);
        setTaxRate(0);
        setSelectedClientId('');
        setSelectedProjectId('none');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create invoice');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string, projectId: string | null) => {
    setIsLoading(true);
    try {
      const res = await sendInvoiceAction(invoiceId, workspaceId, projectId);
      if (res.success) {
        toast.success(`Invoice sent successfully to client`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to send invoice');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, projectId: string | null) => {
    setIsLoading(true);
    try {
      const res = await markAsPaidAction(invoiceId, workspaceId, projectId);
      if (res.success) {
        toast.success(`Invoice marked as PAID`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to mark invoice as paid');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    setIsLoading(true);
    try {
      const res = await deleteInvoiceAction(invoiceToDelete.id, workspaceId, invoiceToDelete.projectId);
      if (res.success) {
        toast.success('Invoice deleted successfully');
        setIsDeleteOpen(false);
        setInvoiceToDelete(null);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to delete invoice');
      }
    } catch (e: unknown) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Format currency
  const formatCurrency = (amount: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.project?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const draftInvoices = invoices.filter(inv => inv.status === 'DRAFT').reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <FadeIn direction="up" delay={0.02} duration={0.3} className="space-y-6">
      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-2 sm:divide-x xl:grid-cols-4 xl:divide-y-0">
        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Total Invoiced</div>
          <div className="mt-2.5 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(totalInvoiced, 'USD')}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Cumulative billing volume</p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Paid Amount</div>
          <div className="mt-2.5 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(paidInvoices, 'USD')}
          </div>
          <p className="mt-1 text-xs font-medium text-brand">Received payments</p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Outstanding</div>
          <div className="mt-2.5 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(outstandingInvoices, 'USD')}
          </div>
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Awaiting settlement</p>
        </div>

        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Drafts</div>
          <div className="mt-2.5 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatCurrency(draftInvoices, 'USD')}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Unsent drafts</p>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          variant="default"
          className="w-full gap-2 sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground">
                <Receipt className="h-6 w-6 text-brand" strokeWidth={1.75} />
              </div>
              <CardTitle className="font-heading text-base font-bold text-foreground">No invoices found</CardTitle>
              <CardDescription className="mt-2 max-w-sm text-sm text-muted-foreground">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search query or status filter.'
                  : 'Generate billing drafts and send payment invoices to your clients.'}
              </CardDescription>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="h-11 border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                    <th className="px-6 align-middle">Invoice No</th>
                    <th className="px-6 align-middle">Client</th>
                    <th className="px-6 align-middle">Project</th>
                    <th className="px-6 align-middle">Due Date</th>
                    <th className="px-6 align-middle">Status</th>
                    <th className="px-6 text-right align-middle">Amount</th>
                    <th className="px-6 text-right align-middle">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-transparent">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="h-[58px] transition-colors hover:bg-secondary/40">
                      <td className="px-6 align-middle font-mono font-semibold text-foreground">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 align-middle font-semibold text-foreground">
                        {invoice.client.companyName}
                      </td>
                      <td className="px-6 align-middle font-medium text-muted-foreground">
                        {invoice.project?.name || <span className="text-xs text-muted-foreground">General Billing</span>}
                      </td>
                      <td className="px-6 align-middle text-xs text-muted-foreground">
                        {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge className={cn('rounded-[5px] border px-2 py-0.5 text-[11px] font-medium shadow-none', STATUS_COLORS[invoice.status] || 'border-border bg-secondary text-foreground')}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 text-right align-middle font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-6 text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspaceId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>

                          {invoice.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendInvoice(invoice.id, invoice.projectId)}
                              disabled={isLoading}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Send to Client"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}

                          {invoice.status === 'SENT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsPaid(invoice.id, invoice.projectId)}
                              disabled={isLoading}
                              className="h-8 w-8 text-muted-foreground hover:text-brand"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => {
                              setInvoiceToDelete(invoice);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-popover sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-destructive">
              <AlertCircle className="h-5 w-5" /> Delete Invoice
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete invoice <span className="font-semibold text-foreground">#{invoiceToDelete?.invoiceNumber}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isLoading}
              onClick={handleDeleteInvoice}
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-border bg-popover sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-base font-bold text-foreground">Create New Invoice</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fill in the form to generate a manual invoice. It will start in DRAFT status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Select Client *</label>
                <Select
                  value={selectedClientId}
                  onValueChange={(val) => {
                    setSelectedClientId(val || '');
                    setSelectedProjectId('none');
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose a client...">
                      {selectedClientId ? (clients.find(c => c.id === selectedClientId)?.companyName || selectedClientId) : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Linked Project (Optional)</label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(val) => setSelectedProjectId(val || 'none')}
                  disabled={!selectedClientId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={selectedClientId ? 'Choose a project...' : 'Select client first'}>
                      {selectedProjectId && selectedProjectId !== 'none'
                        ? (filteredProjects.find(p => p.id === selectedProjectId)?.name || selectedProjectId)
                        : selectedProjectId === 'none' ? 'No Project (General Billing)' : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="none">No Project (General Billing)</SelectItem>
                    {filteredProjects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Due Date *</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Currency</label>
                <Select value={currency} onValueChange={(val) => setCurrency(val || 'USD')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="IDR">IDR (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Tax Rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Invoice Line Items</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  className="gap-1 text-xs font-medium text-foreground"
                >
                  <PlusCircle className="h-4 w-4 text-brand" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="space-y-3 rounded-md border border-border bg-secondary/40 p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                      <div className="space-y-1 sm:col-span-6">
                        <Input
                          type="text"
                          placeholder="Item name * (e.g. Frontend Development)"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-3">
                        <Input
                          type="number"
                          placeholder="Unit Price"
                          min="0"
                          step="0.01"
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="text-xs"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-center sm:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="min-h-[50px] py-2 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 border-t border-border pt-4 text-muted-foreground">
              <div className="flex gap-4">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex gap-4">
                <span>Tax ({taxRate}%):</span>
                <span className="font-mono font-semibold tabular-nums text-foreground">{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex gap-4 border-t border-border pt-1.5 text-sm font-bold text-foreground">
                <span>Total Due:</span>
                <span className="font-mono tabular-nums">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Draft Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
}
