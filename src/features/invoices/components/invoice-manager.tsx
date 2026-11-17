'use client';
import type { Serialized } from '@/lib/serialize';

import { getErrorMessage } from '@/lib/errors';

import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, Client, Frequency } from '@prisma/client';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  CreditCard, 
  Calendar,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import {
  getRecurringInvoiceAction,
  saveRecurringInvoiceAction
} from '../actions/recurring-invoice-actions';

// Serialized<>: money columns arrive as numbers, not Prisma Decimal, because the
// repository converts them before crossing the Server -> Client boundary.
type ExtendedInvoice = Serialized<Invoice & { items: InvoiceItem[]; client: Client }>;

interface InvoiceManagerProps {
  projectId: string;
  workspaceId: string;
  clientId: string;
  initialInvoices: ExtendedInvoice[];
  workspaceSlug: string;
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
  DRAFT: 'bg-muted text-muted-foreground border border-border',
  SENT: 'bg-secondary text-foreground border border-border',
  PAID: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  OVERDUE: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
  CANCELLED: 'bg-muted text-muted-foreground border border-border',
};

export function InvoiceManager({ projectId, workspaceId, clientId, initialInvoices }: InvoiceManagerProps) {
  const router = useRouter();
  const invoices = initialInvoices;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [dueDate, setDueDate] = useState<string>(() => toDateInputValue(14));
  const [currency, setCurrency] = useState<string>('USD');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<BuilderItem[]>([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<ExtendedInvoice | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Recurring Invoice states
  const [isRecurringActive, setIsRecurringActive] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>('MONTHLY');
  const [recurringNextRun, setRecurringNextRun] = useState<string>(() => toDateInputValue(7));
  const [isRecurringLoading, setIsRecurringLoading] = useState<boolean>(false);

  // Fetch Recurring Configuration on mount
  useEffect(() => {
    async function loadRecurringConfig() {
      setIsRecurringLoading(true);
      try {
        const res = await getRecurringInvoiceAction(workspaceId, clientId);
        if (res.success && res.data) {
          setIsRecurringActive(res.data.active);
          setRecurringFrequency(res.data.frequency);
          setRecurringNextRun(new Date(res.data.nextRunAt).toISOString().split('T')[0]);
        }
      } catch (err: unknown) {
        console.error('Failed to load recurring invoice config:', err);
      } finally {
        setIsRecurringLoading(false);
      }
    }
    loadRecurringConfig();
  }, [workspaceId, clientId]);

  const handleSaveRecurringSettings = async () => {
    // Check if client has invoices
    if (invoices.length === 0) {
      toast.error('You must create at least one manual invoice before enabling recurring billing.');
      return;
    }

    setIsRecurringLoading(true);
    try {
      const res = await saveRecurringInvoiceAction(
        workspaceId,
        clientId,
        {
          clientId,
          frequency: recurringFrequency as Frequency,
          nextRunAt: new Date(recurringNextRun),
          active: isRecurringActive,
        },
        projectId
      );

      if (res.success) {
        toast.success('Recurring billing settings updated successfully');
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update recurring settings');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'An error occurred while saving recurring settings'));
    } finally {
      setIsRecurringLoading(false);
    }
  };

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
        clientId,
        projectId,
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

  const handleSendInvoice = async (invoiceId: string) => {
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

  const handleMarkAsPaid = async (invoiceId: string) => {
    setIsLoading(true);
    try {
      const res = await markAsPaidAction(invoiceId, workspaceId, projectId);
      if (res.success) {
        toast.success(`Invoice marked as PAID`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update invoice status');
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
      const res = await deleteInvoiceAction(invoiceToDelete.id, workspaceId, projectId);
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

  const handleDownloadPdf = (invoiceId: string) => {
    window.open(`/api/v1/invoices/${invoiceId}/pdf?workspaceId=${workspaceId}`, '_blank');
  };

  // Helper: Format currency
  const formatCurrency = (amount: number | string, curr = 'USD') => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(num);
  };

  // Helper: Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // KPI Calculations
  const invoiceStats = invoices.reduce(
    (acc, inv) => {
      const val = Number(inv.totalAmount);
      if (inv.status !== 'CANCELLED') {
        acc.totalInvoiced += val;
      }
      if (inv.status === 'PAID') {
        acc.collected += val;
      }
      if (inv.status === 'SENT') {
        acc.pending += val;
      }
      if (inv.status === 'DRAFT') {
        acc.drafts += val;
      }
      return acc;
    },
    { totalInvoiced: 0, collected: 0, pending: 0, drafts: 0 }
  );

  return (
    <div className="space-y-6">
      {/* KPI Ledger Strip */}
      <div className="grid sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Total Billed</span>
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          <div className="font-mono text-xl font-bold tabular-nums text-foreground">
            {formatCurrency(invoiceStats.totalInvoiced, currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">Excludes cancelled invoices</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Collected</span>
            <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-mono text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatCurrency(invoiceStats.collected, currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">Paid in full</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Pending</span>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-xl font-bold tabular-nums text-foreground">
            {formatCurrency(invoiceStats.pending, currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">Sent to client, awaiting payment</p>
        </div>

        <div className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Drafts</span>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-mono text-xl font-bold tabular-nums text-muted-foreground">
            {formatCurrency(invoiceStats.drafts, currency)}
          </div>
          <p className="text-[11px] text-muted-foreground">Unsent invoices</p>
        </div>
      </div>

      {/* Recurring Invoice settings card */}
      <Card className="border-border bg-card rounded-lg overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-brand" /> Recurring Invoice Automation
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 text-muted-foreground">
                Automatically clone and email the latest invoice for this client on a recurring schedule.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-4">
          {invoices.length === 0 ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-500/20 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-bold">Manual Invoice Required</p>
                <p className="text-muted-foreground">
                  Recurring billing requires at least one manual invoice for this client to act as a template. Please create an invoice first.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <label className="text-xs font-semibold text-foreground">
                    Enable Automatic Recurring Billing
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    If active, the system will process schedules automatically on the designated run dates.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isRecurringActive}
                  onChange={(e) => setIsRecurringActive(e.target.checked)}
                  disabled={isRecurringLoading}
                  className="h-4 w-4 rounded border-border accent-brand cursor-pointer"
                />
              </div>

              {isRecurringActive && (
                <div className="grid gap-4 sm:grid-cols-2 p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Billing Frequency</label>
                    <Select
                      value={recurringFrequency}
                      onValueChange={(val) => setRecurringFrequency(val || 'MONTHLY')}
                      disabled={isRecurringLoading}
                    >
                      <SelectTrigger className="bg-background border-border h-9 text-xs">
                        <SelectValue placeholder="Select Frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Next Scheduled Run Date</label>
                    <Input
                      type="date"
                      value={recurringNextRun}
                      onChange={(e) => setRecurringNextRun(e.target.value)}
                      disabled={isRecurringLoading}
                      className="bg-background border-border text-xs h-9"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveRecurringSettings}
                  disabled={isRecurringLoading}
                  className="text-xs font-semibold h-8"
                >
                  {isRecurringLoading ? 'Saving Settings...' : 'Save Automation Settings'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Header bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-foreground">Billing History</h3>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="text-xs font-semibold"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Invoice
        </Button>
      </div>

      {/* Invoices List Table */}
      <Card className="border-border bg-card rounded-lg overflow-hidden">
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">No invoices generated yet</p>
              <p className="text-xs text-muted-foreground">Click &ldquo;Create Invoice&rdquo; to start billing for project deliverables.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">Invoice Number</th>
                    <th className="py-3 px-4 font-semibold">Due Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
                    <th className="py-3 px-4 font-semibold text-right">Tax</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`text-[11px] font-semibold px-2 border ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(Number(invoice.subtotal), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-muted-foreground">
                        {formatCurrency(Number(invoice.taxAmount), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-foreground">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                           {/* Send Action */}
                          {invoice.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleSendInvoice(invoice.id)}
                              title="Send Invoice to client"
                              disabled={isLoading}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {/* Mark as Paid Action */}
                          {invoice.status === 'SENT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                              onClick={() => handleMarkAsPaid(invoice.id)}
                              title="Mark invoice as paid"
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {/* PDF Export */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDownloadPdf(invoice.id)}
                            title="Download PDF Invoice"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                          {/* Delete Action */}
                          {(invoice.status === 'DRAFT' || invoice.status === 'SENT') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                setInvoiceToDelete(invoice);
                                setIsDeleteOpen(true);
                              }}
                              title="Delete invoice"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
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

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-brand" /> Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Add billed line items, adjust currency rates, and configure tax rates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Due Date</label>
                <Input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-background border-border text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Currency</label>
                <Select value={currency} onValueChange={(val) => setCurrency(val ?? 'USD')}>
                  <SelectTrigger className="bg-background border-border h-9 text-xs">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="IDR">IDR (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tax Rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="bg-background border-border text-xs font-mono tabular-nums"
                />
              </div>
            </div>

            {/* Line Items builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-semibold text-muted-foreground">Line Items</h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddItem}
                  className="cursor-pointer h-8 text-xs text-foreground font-semibold hover:bg-muted"
                >
                  <PlusCircle className="mr-1 h-4 w-4 text-brand" /> Add Line Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg border border-border relative pr-10">
                  <div className="grid gap-3 grid-cols-12 flex-1">
                    <div className="col-span-6 space-y-1">
                      <Input
                        placeholder="Item name (e.g. Website Mockup Design)"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                        className="bg-background border-border h-9 text-xs"
                      />
                      <Input
                        placeholder="Optional description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="bg-background border-border h-8 text-[11px] font-normal"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        className="bg-background border-border h-9 text-xs text-center font-mono tabular-nums"
                      />
                    </div>
                    <div className="col-span-4 space-y-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        required
                        className="bg-background border-border h-9 text-xs text-right font-mono tabular-nums"
                      />
                      <div className="text-right text-[11px] font-mono tabular-nums font-semibold text-muted-foreground pt-1">
                        Total: {formatCurrency(item.quantity * item.unitPrice, currency)}
                      </div>
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="absolute right-2.5 top-3.5 text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <MinusCircle className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Cost calculations panel */}
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums font-semibold text-foreground">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({taxRate}%):</span>
                  <span className="font-mono tabular-nums font-semibold text-foreground">{formatCurrency(taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
                  <span className="text-foreground">Grand Total:</span>
                  <span className="font-mono tabular-nums text-foreground">{formatCurrency(totalAmount, currency)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="cursor-pointer border-border text-foreground font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="font-semibold"
              >
                {isLoading ? 'Creating...' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-foreground">Delete Invoice</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Are you sure you want to delete invoice <strong className="text-foreground font-mono">&ldquo;{invoiceToDelete?.invoiceNumber}&rdquo;</strong>? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setIsDeleteOpen(false);
                setInvoiceToDelete(null);
              }}
              className="cursor-pointer border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteInvoice}
              className="cursor-pointer font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
