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

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-zinc-100/80 text-zinc-650 border-zinc-200/50 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-800 shadow-none',
  SENT: 'bg-blue-500/10 text-blue-600 dark:text-blue-450 border-blue-500/20 shadow-none',
  PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20 shadow-none',
  OVERDUE: 'bg-red-500/10 text-red-600 dark:text-red-450 border-red-500/20 shadow-none',
  CANCELLED: 'bg-zinc-200/50 text-zinc-500 border-zinc-200 shadow-none dark:bg-zinc-800/20 dark:text-zinc-550 dark:border-zinc-800',
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

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const draftInvoices = invoices.filter(inv => inv.status === 'DRAFT').reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <FadeIn direction="up" delay={0.02} duration={0.35} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card variant="elevated" className="bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 border-l-[3px] border-l-zinc-500/70 p-5 h-[120px] flex flex-col justify-between shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Invoiced</span>
            <div className="p-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 rounded-lg">
              <Receipt className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formatCurrency(totalInvoiced, 'USD')}
            </span>
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-0.5">Cumulative billing volume</span>
          </div>
        </Card>

        <Card variant="elevated" className="bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 border-l-[3px] border-l-emerald-500/70 p-5 h-[120px] flex flex-col justify-between shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Paid Amount</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formatCurrency(paidInvoices, 'USD')}
            </span>
            <span className="text-[10px] text-emerald-500 mt-0.5">Received payments</span>
          </div>
        </Card>

        <Card variant="elevated" className="bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 border-l-[3px] border-l-amber-500/70 p-5 h-[120px] flex flex-col justify-between shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Outstanding</span>
            <div className="p-1.5 bg-amber-50 dark:bg-amber-955/20 border border-amber-100 dark:border-amber-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formatCurrency(outstandingInvoices, 'USD')}
            </span>
            <span className="text-[10px] text-amber-500 mt-0.5">Awaiting settlement</span>
          </div>
        </Card>

        <Card variant="elevated" className="bg-white dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 border-l-[3px] border-l-blue-500/70 p-5 h-[120px] flex flex-col justify-between shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Drafts</span>
            <div className="p-1.5 bg-blue-50 dark:bg-blue-955/20 border border-blue-100 dark:border-blue-900/20 rounded-lg">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
              {formatCurrency(draftInvoices, 'USD')}
            </span>
            <span className="text-[10px] text-blue-500 mt-0.5">Unsent invoices</span>
          </div>
        </Card>
      </div>

      {/* Top action block */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial min-w-[240px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm border-border/60 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-150"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="w-[150px] h-10 text-sm border-border/60 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-zinc-400" />
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

        {/* Action buttons */}
        <Button 
          onClick={() => setIsCreateOpen(true)}
          variant="default"
          className="w-full sm:w-auto h-10 px-4 font-semibold text-sm flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* Invoices List Card */}
      <Card variant="elevated" className="border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 rounded-2xl shadow-xs overflow-hidden backdrop-blur-md">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16 text-zinc-450 dark:text-zinc-500 text-sm flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-450 mb-4 border border-border/60">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50 font-heading">No invoices found</CardTitle>
              <CardDescription className="max-w-sm mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search query or status filter.'
                  : 'Generate billing drafts and send payment invoices to your clients.'}
              </CardDescription>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-50/30 dark:bg-zinc-950/20 h-[48px]">
                    <th className="px-6 align-middle font-medium">Invoice No</th>
                    <th className="px-6 align-middle font-medium">Client</th>
                    <th className="px-6 align-middle font-medium">Project</th>
                    <th className="px-6 align-middle font-medium">Due Date</th>
                    <th className="px-6 align-middle font-medium">Status</th>
                    <th className="px-6 align-middle font-medium text-right">Amount</th>
                    <th className="px-6 align-middle font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-transparent">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors h-[60px]">
                      <td className="px-6 align-middle font-semibold text-zinc-900 dark:text-zinc-550">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 align-middle font-semibold text-zinc-800 dark:text-zinc-350">
                        {invoice.client.companyName}
                      </td>
                      <td className="px-6 align-middle text-zinc-650 dark:text-zinc-400 font-medium">
                        {invoice.project?.name || <span className="text-xs text-zinc-500 dark:text-zinc-550">General Billing</span>}
                      </td>
                      <td className="px-6 align-middle text-zinc-500 dark:text-zinc-450 text-xs">
                        {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 align-middle">
                        <Badge className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border shadow-none", STATUS_COLORS[invoice.status] || 'bg-slate-100 text-slate-800')}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 align-middle text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-6 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                           <a 
                            href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspaceId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer h-8 w-8 text-slate-400 hover:text-slate-900 rounded-md"
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
                              className="cursor-pointer h-8 w-8 text-slate-400 hover:text-blue-600 rounded-md"
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
                              className="cursor-pointer h-8 w-8 text-slate-400 hover:text-emerald-700 rounded-md"
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
                            className="cursor-pointer h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-650 rounded-md"
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
