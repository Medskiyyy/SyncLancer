import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle } from 'lucide-react';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function ClientInvoicesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  // Validate workspace membership
  try {
    await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);
  } catch {
    redirect('/');
  }

  // Look up client relationship
  const clientUser = await prisma.clientUser.findFirst({
    where: { userId: session.user.id },
    include: { client: true },
  });

  if (!clientUser || clientUser.client.workspaceId !== workspace.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          You do not have a client profile linked in this workspace.
        </p>
      </div>
    );
  }

  // Fetch all invoices belonging to the client
  const invoices = await prisma.invoice.findMany({
    where: {
      clientId: clientUser.clientId,
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      project: {
        select: { name: true }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculations
  const outstandingBalance = invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((acc, inv) => acc + Number(inv.totalAmount), 0);

  const formatCurrency = (amount: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
    SENT: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    OVERDUE: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800',
    CANCELLED: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Invoices & Billing</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review your billing statements, invoices, and payment history.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3 px-4 flex items-center gap-3">
          <div>
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Total Outstanding</span>
            <div className="font-mono text-lg font-semibold tabular-nums text-foreground">
              {formatCurrency(outstandingBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <Card className="border-border bg-card rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Billing History
          </CardTitle>
          <CardDescription className="text-xs">
            A comprehensive list of all invoices issued to {clientUser.client.companyName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground space-y-2">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-semibold text-foreground">No invoices found</p>
              <p className="text-xs text-muted-foreground">You have no invoices generated for your account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground">
                    <th className="py-3 px-4 font-bold">Invoice Number</th>
                    <th className="py-3 px-4 font-bold">Project</th>
                    <th className="py-3 px-4 font-bold">Due Date</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Total Amount</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {invoice.project?.name || 'General Billing'}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-medium">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={`text-[11px] font-semibold uppercase tracking-wider px-2 border ${STATUS_COLORS[invoice.status]}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a 
                          href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspace.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-zinc-400 hover:text-slate-600 dark:hover:text-zinc-200"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
