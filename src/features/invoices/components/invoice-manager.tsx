'use client';

import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceStatus, Client } from '@prisma/client';
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
  XCircle,
  PlusCircle,
  MinusCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

interface ExtendedInvoice extends Invoice {
  items: InvoiceItem[];
  client: Client;
}

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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200',
  SENT: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-250',
  OVERDUE: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-200',
  CANCELLED: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
};

export function InvoiceManager({ projectId, workspaceId, clientId, initialInvoices, workspaceSlug }: InvoiceManagerProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<ExtendedInvoice[]>(initialInvoices);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 14 days from now
  );
  const [currency, setCurrency] = useState<string>('USD');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<BuilderItem[]>([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<ExtendedInvoice | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Sync initialInvoices prop with local state when it updates
  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  const handleAddItem = () => {
    setItems([...items, { name: '', description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof BuilderItem, value: any) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index].quantity = parseInt(value) || 0;
    } else if (field === 'unitPrice') {
      newItems[index].unitPrice = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value as never;
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Billed</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-950 dark:text-slate-50">
              {formatCurrency(invoiceStats.totalInvoiced, currency)}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Excludes cancelled invoices</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-950 dark:text-slate-50 text-emerald-650 dark:text-emerald-450">
              {formatCurrency(invoiceStats.collected, currency)}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Paid in full</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-950 dark:text-slate-50 text-blue-650 dark:text-blue-450">
              {formatCurrency(invoiceStats.pending, currency)}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Sent to client, awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400">Drafts</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-950 dark:text-slate-50 text-slate-650 dark:text-slate-400">
              {formatCurrency(invoiceStats.drafts, currency)}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">Unsent invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Header bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Billing History</h3>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/10"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Invoice
        </Button>
      </div>

      {/* Invoices List Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-slate-550 dark:text-slate-400 space-y-2">
              <DollarSign className="h-10 w-10 mx-auto text-slate-350 dark:text-slate-700" />
              <p className="text-sm font-semibold">No invoices generated yet</p>
              <p className="text-xs text-slate-450">Click "Create Invoice" to start billing for project deliverables.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/20 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-bold">Invoice Number</th>
                    <th className="py-3 px-4 font-bold">Due Date</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Subtotal</th>
                    <th className="py-3 px-4 font-bold text-right">Tax</th>
                    <th className="py-3 px-4 font-bold text-right">Total</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-50">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-455 font-medium">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider px-2 border ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-650 dark:text-slate-400">
                        {formatCurrency(Number(invoice.subtotal), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-650 dark:text-slate-400">
                        {formatCurrency(Number(invoice.taxAmount), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-50">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Action */}
                          {invoice.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-500 hover:text-blue-750 dark:hover:text-blue-400"
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
                              className="h-7 w-7 text-emerald-500 hover:text-emerald-750 dark:hover:text-emerald-400"
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
                            className="h-7 w-7 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                              className="h-7 w-7 text-red-400 hover:text-red-650 dark:hover:text-red-400"
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
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-2xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" /> Create New Invoice
            </DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-slate-400 text-xs">
              Add billed line items, adjust currency rates, and configure tax rates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
                <Input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Currency</label>
                <Select value={currency} onValueChange={(val) => setCurrency(val ?? 'USD')}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-800">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="IDR">IDR (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Line Items builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Line Items</h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddItem}
                  className="h-8 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                >
                  <PlusCircle className="mr-1 h-4 w-4" /> Add Line Item
                </Button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-lg border border-slate-100 dark:border-slate-900 relative pr-10">
                  <div className="grid gap-3 grid-cols-12 flex-1">
                    <div className="col-span-6 space-y-1">
                      <Input
                        placeholder="Item name (e.g. Website Mockup Design)"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs"
                      />
                      <Input
                        placeholder="Optional description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-8 text-[11px] font-normal"
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
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs text-center"
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
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-9 text-xs text-right"
                      />
                      <div className="text-right text-[10px] font-bold text-slate-500 pt-1">
                        Total: {formatCurrency(item.quantity * item.unitPrice, currency)}
                      </div>
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="absolute right-2.5 top-3.5 text-red-400 hover:text-red-650 dark:hover:text-red-400"
                    >
                      <MinusCircle className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total Cost calculations panel */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxRate}%):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">{formatCurrency(taxAmount, currency)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-150 dark:border-slate-800 pt-2 text-sm font-bold">
                  <span className="text-slate-900 dark:text-slate-50">Grand Total:</span>
                  <span className="text-indigo-650 dark:text-indigo-400">{formatCurrency(totalAmount, currency)}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isLoading ? 'Creating...' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-slate-100">Delete Invoice</DialogTitle>
            <DialogDescription className="text-slate-550 dark:text-slate-400 text-xs">
              Are you sure you want to delete invoice <strong className="text-slate-800 dark:text-slate-200">"{invoiceToDelete?.invoiceNumber}"</strong>? This action is permanent and cannot be undone.
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
              className="border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoading}
              onClick={handleDeleteInvoice}
              className="bg-red-650 hover:bg-red-700 text-white font-medium"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
