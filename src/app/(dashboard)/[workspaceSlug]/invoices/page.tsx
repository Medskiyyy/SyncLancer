import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { WorkspaceInvoiceManager } from '@/features/invoices/components/workspace-invoice-manager';
import prisma from '@/lib/prisma';

const workspaceService = new WorkspaceService();

interface PageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceInvoicesPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const workspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!workspace) {
    notFound();
  }

  // Verify access
  await workspaceService.validateWorkspaceAccess(workspace.id, session.user.id);

  // Fetch invoices, clients, and projects in parallel
  const [invoices, clients, projects] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        workspaceId: workspace.id,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            companyName: true,
            primaryEmail: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.client.findMany({
      where: {
        workspaceId: workspace.id,
        archived: false,
        deletedAt: null,
      },
      select: {
        id: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    }),
    prisma.project.findMany({
      where: {
        workspaceId: workspace.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        clientId: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  // Map Decimals to numbers for client components serialization compatibility
  const mappedInvoices = invoices.map((inv) => ({
    ...inv,
    subtotal: Number(inv.subtotal),
    taxAmount: Number(inv.taxAmount),
    totalAmount: Number(inv.totalAmount),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-550">Invoices</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage, send, and track client billing invoices in this workspace.
        </p>
      </div>

      <WorkspaceInvoiceManager
        workspaceId={workspace.id}
        workspaceSlug={workspaceSlug}
        initialInvoices={mappedInvoices}
        clients={clients}
        projects={projects}
      />
    </div>
  );
}
