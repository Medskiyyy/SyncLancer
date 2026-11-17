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
      <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={1.75} />
        <h2 className="font-heading text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
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
    DRAFT: 'border-border bg-secondary text-foreground',
    SENT: 'border-border bg-secondary text-foreground',
    PAID: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    OVERDUE: 'border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400',
    CANCELLED: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Invoices & Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your billing statements, invoices, and payment history.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-2.5">
          <span className="text-[11px] font-medium text-muted-foreground">Total Outstanding</span>
          <div className="font-heading text-lg font-bold tabular-nums text-foreground">
            {formatCurrency(outstandingBalance)}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
            <FileText className="h-4 w-4 text-brand" strokeWidth={1.75} /> Billing History
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            A comprehensive list of all invoices issued to {clientUser.client.companyName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="space-y-2 py-12 text-center text-muted-foreground">
              <FileText className="mx-auto h-9 w-9 text-muted-foreground/50" />
              <p className="text-sm font-semibold text-foreground">No invoices found</p>
              <p className="text-xs text-muted-foreground">You have no invoices generated for your account.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-secondary/40">
                      <td className="px-4 py-3.5 font-mono font-semibold text-foreground">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {invoice.project?.name || 'General Billing'}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={`px-2 text-[11px] font-medium ${STATUS_COLORS[invoice.status] || 'border-border bg-secondary text-foreground'}`}>
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums text-foreground">
                        {formatCurrency(Number(invoice.totalAmount), invoice.currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <a
                          href={`/api/v1/invoices/${invoice.id}/pdf?workspaceId=${workspace.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
