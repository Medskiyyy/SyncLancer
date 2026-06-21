'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  CheckCircle, 
  FileText, 
  DollarSign, 
  Receipt, 
  Calendar,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Search,
  Filter
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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-505 border-zinc-200/60 dark:border-zinc-850',
  SENT: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15',
  PAID: 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-550/15',
  OVERDUE: 'bg-red-500/10 text-red-655 dark:text-red-400 border border-red-550/15',
  CANCELLED: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/30',
};

export function WorkspaceInvoiceManager({ 
  workspaceId, 
  workspaceSlug, 
  initialInvoices, 
  clients, 
  projects 
}: WorkspaceInvoiceManagerProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<MappedInvoice[]>(initialInvoices);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('none');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [currency, setCurrency] = useState<string>('USD');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [items, setItems] = useState<BuilderItem[]>([
    { name: '', description: '', quantity: 1, unitPrice: 0 }
  ]);

  // Delete modal state
  const [invoiceToDelete, setInvoiceToDelete] = useState<MappedInvoice | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Sync initialInvoices prop with local state when it updates
  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  // Reset project when client changes
  useEffect(() => {
    setSelectedProjectId('none');
  }, [selectedClientId]);

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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
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
      const res = await deleteInvoiceAction(invoiceToDelete.id, workspaceId, invoiceToDelete.projectId);
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

  return (
    <div className="space-y-6">
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              type="text" 
              placeholder="Search invoice number, client or project..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-zinc-400" />
                <SelectValue placeholder="All Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action buttons */}
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 h-9 font-semibold text-xs flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* Invoices List Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 text-zinc-450 dark:text-zinc-500 text-sm">
              <Receipt className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              No invoices found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <th className="py-3 px-4">Invoice No</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-250 dark:divide-zinc-850 text-xs">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-50">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-zinc-650 dark:text-zinc-300">
                        {invoice.client.companyName}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-655 dark:text-zinc-400 font-medium">
                        {invoice.project?.name || <span className="text-[10px] text-zinc-400">General Billing</span>}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-650 dark:text-zinc-400 font-medium">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`cursor-pointer text-[9px] font-bold uppercase tracking-wider px-2 border ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                           <a 
                            href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspaceId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-7 w-7 text-zinc-450 hover:text-primary dark:hover:text-amber-400"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          
                          {invoice.status === 'DRAFT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendInvoice(invoice.id, invoice.projectId)}
                              disabled={isLoading}
                              className="cursor-pointer h-7 w-7 text-zinc-450 hover:text-blue-650 dark:hover:text-blue-400"
                              title="Send to Client"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {invoice.status === 'SENT' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsPaid(invoice.id, invoice.projectId)}
                              disabled={isLoading}
                              className="cursor-pointer h-7 w-7 text-zinc-450 hover:text-emerald-650 dark:hover:text-emerald-400"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
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
                            className="cursor-pointer h-7 w-7 text-zinc-450 hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-base font-bold">
              <AlertCircle className="h-5 w-5" /> Delete Invoice
            </DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Are you sure you want to delete invoice <span className="font-bold text-zinc-700 dark:text-zinc-300">#{invoiceToDelete?.invoiceNumber}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isLoading}
              onClick={handleDeleteInvoice}
              className="cursor-pointer text-xs font-semibold"
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">Create New Invoice</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Fill in the form to generate a manual invoice. It will start in **DRAFT** status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2 text-xs">
            {/* Top row: Client and Project selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-400">Select Client *</label>
                <Select value={selectedClientId} onValueChange={(val) => setSelectedClientId(val || '')}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-400">Linked Project (Optional)</label>
                <Select 
                  value={selectedProjectId} 
                  onValueChange={(val) => setSelectedProjectId(val || 'none')}
                  disabled={!selectedClientId}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={selectedClientId ? "Choose a project..." : "Select client first"} />
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

            {/* Middle row: Due Date, Currency, Tax Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-400">Due Date *</label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 dark:text-zinc-400">Currency</label>
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
                <label className="font-bold text-zinc-700 dark:text-zinc-400">Tax Rate (%)</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={taxRate} 
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} 
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Line Items builder */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Invoice Line Items</label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAddItem}
                  className="cursor-pointer text-primary dark:text-indigo-400 text-xs font-semibold flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" /> Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 border border-zinc-150 dark:border-zinc-800 rounded-lg space-y-3 bg-zinc-50/30">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-6 space-y-1">
                        <Input 
                          type="text" 
                          placeholder="Item name * (e.g. Frontend Development)" 
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>
                      {/* Qty */}
                      <div className="sm:col-span-2 space-y-1">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>
                      {/* Price */}
                      <div className="sm:col-span-3 space-y-1">
                        <Input 
                          type="number" 
                          placeholder="Unit Price" 
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="h-9 text-xs"
                          required
                        />
                      </div>
                      {/* Delete item */}
                      <div className="sm:col-span-1 flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="cursor-pointer h-9 w-9 text-zinc-400 hover:text-destructive hover:bg-destructive/10"
                        >
                          <MinusCircle className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Description */}
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

            {/* Summary block */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 flex flex-col items-end gap-1.5 text-zinc-650 dark:text-zinc-400">
              <div className="flex gap-4">
                <span>Subtotal:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex gap-4">
                <span>Tax ({taxRate}%):</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(taxAmount, currency)}</span>
              </div>
              <div className="flex gap-4 text-sm font-black border-t border-zinc-150 dark:border-zinc-805 pt-1.5 text-zinc-900 dark:text-zinc-50">
                <span>Total Due:</span>
                <span>{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>

            {/* Actions */}
            <DialogFooter className="pt-4 border-t border-zinc-150 dark:border-zinc-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg px-4 h-9 shadow-sm"
              >
                Create Draft Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
