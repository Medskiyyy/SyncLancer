import prisma from '@/lib/prisma';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { 
  Role, 
  InvoiceStatus, 
  ProjectStatus, 
  TaskStatus, 
  MilestoneStatus, 
  LeadStatus, 
  ProposalStatus 
} from '@prisma/client';
import { 
  startOfMonth, 
  subMonths, 
  endOfMonth, 
  format, 
  startOfWeek, 
  formatDistanceToNow 
} from 'date-fns';

export class AnalyticsService {
  private workspaceService: WorkspaceService;

  constructor() {
    this.workspaceService = new WorkspaceService();
  }

  async getWorkspaceDashboardData(workspaceId: string, userId: string) {
    // 1. Enforce workspace access security
    await this.workspaceService.validateWorkspaceAccess(workspaceId, userId);

    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));
    const startOfWeekDate = startOfWeek(now, { weekStartsOn: 1 });

    const [
      paidInvoices,
      pendingInvoices,
      activeProjectsCount,
      lastMonthActiveProjectsCount,
      activeClientsCount,
      lastMonthClientsCount,
      projectsByStatus,
      timeEntries,
      activeTasksCount,
      upcomingMilestone,
      dbInvoices,
      dbProposals,
      dbLeads,
      dbMilestones
    ] = await Promise.all([
      // 2. Query Paid Invoices for Workspace
      prisma.invoice.findMany({
        where: {
          workspaceId,
          status: InvoiceStatus.PAID,
          deletedAt: null,
        },
        select: {
          totalAmount: true,
          createdAt: true,
        },
      }),
      // 3. Query Pending Invoices
      prisma.invoice.findMany({
        where: {
          workspaceId,
          status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
          deletedAt: null,
        },
        select: {
          totalAmount: true,
        },
      }),
      // 4. Query Active Projects
      prisma.project.count({
        where: {
          workspaceId,
          status: ProjectStatus.ACTIVE,
          deletedAt: null,
        },
      }),
      prisma.project.count({
        where: {
          workspaceId,
          status: ProjectStatus.ACTIVE,
          createdAt: { lt: startOfCurrentMonth },
          deletedAt: null,
        },
      }),
      // 5. Query Active Clients
      prisma.client.count({
        where: {
          workspaceId,
          archived: false,
          deletedAt: null,
        },
      }),
      prisma.client.count({
        where: {
          workspaceId,
          archived: false,
          createdAt: { lt: startOfCurrentMonth },
          deletedAt: null,
        },
      }),
      // 6. Project Status Distribution (for Status Chart)
      prisma.project.groupBy({
        by: ['status'],
        where: {
          workspaceId,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      }),
      // 8. Workload & Progress: time entries
      prisma.timeEntry.findMany({
        where: {
          project: {
            workspaceId,
            deletedAt: null,
          },
          startTime: {
            gte: startOfWeekDate,
          },
        },
        select: {
          durationMinutes: true,
        },
      }),
      // 8. Workload & Progress: active tasks count
      prisma.task.count({
        where: {
          project: {
            workspaceId,
            deletedAt: null,
          },
          status: {
            in: [TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
          },
        },
      }),
      // 8. Workload & Progress: upcoming milestone
      prisma.milestone.findFirst({
        where: {
          project: {
            workspaceId,
            deletedAt: null,
          },
          status: {
            in: [MilestoneStatus.NOT_STARTED, MilestoneStatus.IN_PROGRESS],
          },
          dueDate: {
            gte: now,
          },
        },
        orderBy: {
          dueDate: 'asc',
        },
        include: {
          project: true,
        },
      }),
      // 9. Recent Activity Feed: invoices
      prisma.invoice.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { client: true },
      }),
      // 9. Recent Activity Feed: proposals
      prisma.proposal.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { client: true },
      }),
      // 9. Recent Activity Feed: leads
      prisma.lead.findMany({
        where: { workspaceId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      // 9. Recent Activity Feed: completed milestones
      prisma.milestone.findMany({
        where: {
          project: { workspaceId, deletedAt: null },
          status: MilestoneStatus.COMPLETED,
        },
        orderBy: {
          dueDate: 'desc',
        },
        take: 5,
        include: { project: true },
      })
    ]);

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    // Calculate revenue comparison (this month vs last month)
    const currentMonthRevenue = paidInvoices
      .filter((inv) => inv.createdAt >= startOfCurrentMonth)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const lastMonthRevenue = paidInvoices
      .filter((inv) => inv.createdAt >= startOfLastMonth && inv.createdAt <= endOfLastMonth)
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    let revenueChangePercent = 0;
    if (lastMonthRevenue > 0) {
      revenueChangePercent = Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
    } else if (currentMonthRevenue > 0) {
      revenueChangePercent = 100;
    }

    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const pendingCount = pendingInvoices.length;

    const projectsChangeCount = activeProjectsCount - lastMonthActiveProjectsCount;

    const clientsChangeCount = activeClientsCount - lastMonthClientsCount;

    const statusLabels: Record<ProjectStatus, string> = {
      [ProjectStatus.DRAFT]: 'Draft',
      [ProjectStatus.ACTIVE]: 'Active',
      [ProjectStatus.ON_HOLD]: 'On Hold',
      [ProjectStatus.REVIEW]: 'Review',
      [ProjectStatus.COMPLETED]: 'Completed',
      [ProjectStatus.CANCELLED]: 'Cancelled',
    };

    const projectStatusDistribution = Object.values(ProjectStatus).map((status) => {
      const match = projectsByStatus.find((p) => p.status === status);
      return {
        status: statusLabels[status],
        count: match ? match._count._all : 0,
      };
    });

    // 7. Rolling 12 Months Revenue Trend
    const monthlyRevenueTrend = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const monthName = format(date, 'MMM yy');
      const revenue = paidInvoices
        .filter((inv) => inv.createdAt >= start && inv.createdAt <= end)
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
      monthlyRevenueTrend.push({ name: monthName, revenue });
    }

    const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
    const hoursLogged = Math.round((totalMinutes / 60) * 10) / 10;

    const activitiesList: Array<{ text: string; time: string; date: Date; type: string }> = [];

    dbInvoices.forEach((inv) => {
      let text = `Invoice #${inv.invoiceNumber} created`;
      if (inv.status === InvoiceStatus.PAID) {
        text = `Invoice #${inv.invoiceNumber} marked as paid by ${inv.client.companyName}`;
      } else if (inv.status === InvoiceStatus.SENT) {
        text = `Invoice #${inv.invoiceNumber} sent to ${inv.client.companyName}`;
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        text = `Invoice #${inv.invoiceNumber} became overdue`;
      }
      activitiesList.push({
        text,
        time: formatDistanceToNow(inv.updatedAt, { addSuffix: true }),
        date: inv.updatedAt,
        type: 'invoice',
      });
    });

    dbProposals.forEach((prop) => {
      let text = `Proposal #${prop.proposalNumber} updated`;
      if (prop.status === ProposalStatus.APPROVED) {
        text = `Proposal "${prop.title}" approved by ${prop.client.companyName}`;
      } else if (prop.status === ProposalStatus.SENT) {
        text = `Proposal "${prop.title}" sent to ${prop.client.companyName}`;
      } else if (prop.status === ProposalStatus.REJECTED) {
        text = `Proposal "${prop.title}" was rejected`;
      }
      activitiesList.push({
        text,
        time: formatDistanceToNow(prop.updatedAt, { addSuffix: true }),
        date: prop.updatedAt,
        type: 'proposal',
      });
    });

    dbLeads.forEach((lead) => {
      let text = `Lead "${lead.name}" (${lead.company}) updated`;
      if (lead.status === LeadStatus.NEW) {
        text = `New Lead "${lead.name}" added`;
      } else if (lead.status === LeadStatus.WON) {
        text = `Lead "${lead.name}" converted to client`;
      }
      activitiesList.push({
        text,
        time: formatDistanceToNow(lead.updatedAt, { addSuffix: true }),
        date: lead.updatedAt,
        type: 'lead',
      });
    });

    dbMilestones.forEach((ms) => {
      activitiesList.push({
        text: `Milestone "${ms.title}" completed in "${ms.project.name}"`,
        time: `due ${format(ms.dueDate, 'MMM d, yyyy')}`,
        date: ms.dueDate,
        type: 'milestone',
      });
    });

    const recentActivities = activitiesList
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    return {
      totalRevenue,
      revenueChangePercent,
      pendingAmount,
      pendingCount,
      activeProjectsCount,
      projectsChangeCount,
      activeClientsCount,
      clientsChangeCount,
      projectStatusDistribution,
      monthlyRevenueTrend,
      hoursLogged,
      activeTasksCount,
      upcomingMilestone: upcomingMilestone ? {
        title: upcomingMilestone.title,
        dueDate: upcomingMilestone.dueDate,
        projectName: upcomingMilestone.project.name,
      } : null,
      recentActivities,
    };
  }
}
