import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  default: {
    invoice: {
      findMany: vi.fn(),
    },
    project: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    client: {
      count: vi.fn(),
    },
    timeEntry: {
      findMany: vi.fn(),
    },
    task: {
      count: vi.fn(),
    },
    milestone: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    proposal: {
      findMany: vi.fn(),
    },
    lead: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/features/workspace/services/workspace-service', () => {
  const mock = vi.fn();
  mock.prototype.validateWorkspaceAccess = vi.fn().mockResolvedValue({});
  return { WorkspaceService: mock };
});

import { AnalyticsService } from '../analytics-service';
import prisma from '@/lib/prisma';
import { ProjectStatus, InvoiceStatus } from '@prisma/client';
import { subMonths, startOfMonth } from 'date-fns';

/**
 * The AnalyticsService.getWorkspaceDashboardData method calls:
 *  1. invoice.findMany (paid invoices — big query)
 *  2. invoice.findMany (pending invoices)
 *  3. project.count x2
 *  4. client.count x2
 *  5. project.groupBy
 *  6. timeEntry.findMany
 *  7. task.count
 *  8. milestone.findFirst
 *  9. invoice.findMany (activity feed)
 * 10. proposal.findMany
 * 11. lead.findMany
 * 12. milestone.findMany
 *
 * We chain mockResolvedValueOnce for the three invoice.findMany calls.
 */
const setupMocks = (opts: {
  paidInvoices?: object[];
  pendingInvoices?: object[];
  activityInvoices?: object[];
  projectCount?: number;
  clientCount?: number;
  groupBy?: object[];
  timeEntries?: object[];
  taskCount?: number;
  upcomingMilestone?: object | null;
  proposals?: object[];
  leads?: object[];
  milestones?: object[];
} = {}) => {
  const {
    paidInvoices = [],
    pendingInvoices = [],
    activityInvoices = [],
    projectCount = 0,
    clientCount = 0,
    groupBy = [],
    timeEntries = [],
    taskCount = 0,
    upcomingMilestone = null,
    proposals = [],
    leads = [],
    milestones = [],
  } = opts;

  (prisma.invoice.findMany as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce(paidInvoices)
    .mockResolvedValueOnce(pendingInvoices)
    .mockResolvedValueOnce(activityInvoices);

  (prisma.project.count as ReturnType<typeof vi.fn>).mockResolvedValue(projectCount);
  (prisma.client.count as ReturnType<typeof vi.fn>).mockResolvedValue(clientCount);
  (prisma.project.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue(groupBy);
  (prisma.timeEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(timeEntries);
  (prisma.task.count as ReturnType<typeof vi.fn>).mockResolvedValue(taskCount);
  (prisma.milestone.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(upcomingMilestone);
  (prisma.proposal.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(proposals);
  (prisma.lead.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(leads);
  (prisma.milestone.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(milestones);
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const WORKSPACE_ID = 'ws-1';
  const USER_ID = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService();
  });

  // ─── Revenue calculations ────────────────────
  describe('revenue calculations', () => {
    it('totalRevenue is sum of all paid invoice amounts', async () => {
      setupMocks({
        paidInvoices: [
          { totalAmount: '500.00', createdAt: new Date() },
          { totalAmount: '300.00', createdAt: new Date() },
        ],
      });

      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.totalRevenue).toBe(800);
    });

    it('revenueChangePercent is 100 when last month had $0', async () => {
      setupMocks({
        paidInvoices: [{ totalAmount: '1000.00', createdAt: new Date() }],
      });

      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.revenueChangePercent).toBe(100);
    });

    it('revenueChangePercent calculates (current - last) / last * 100', async () => {
      const now = new Date();
      const lastMonthDate = startOfMonth(subMonths(now, 1));

      setupMocks({
        paidInvoices: [
          { totalAmount: '200.00', createdAt: lastMonthDate }, // last month
          { totalAmount: '300.00', createdAt: now },           // this month
        ],
      });

      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      // (300 - 200) / 200 * 100 = 50
      expect(data.revenueChangePercent).toBe(50);
    });

    it('revenueChangePercent is 0 when both months are $0', async () => {
      setupMocks();
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.revenueChangePercent).toBe(0);
    });
  });

  // ─── monthlyRevenueTrend shape ───────────────
  describe('monthlyRevenueTrend', () => {
    it('always returns exactly 12 data points', async () => {
      setupMocks();
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.monthlyRevenueTrend).toHaveLength(12);
    });

    it('each entry has name (string) and revenue (number)', async () => {
      setupMocks();
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      for (const entry of data.monthlyRevenueTrend) {
        expect(typeof entry.name).toBe('string');
        expect(typeof entry.revenue).toBe('number');
      }
    });
  });

  // ─── hoursLogged ─────────────────────────────
  describe('hoursLogged', () => {
    it('converts minutes to hours rounded to 1 decimal place', async () => {
      setupMocks({
        timeEntries: [{ durationMinutes: 60 }, { durationMinutes: 35 }], // 95 min = 1.6h
      });
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.hoursLogged).toBe(1.6);
    });

    it('returns 0 when no time entries this week', async () => {
      setupMocks();
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.hoursLogged).toBe(0);
    });
  });

  // ─── projectStatusDistribution ───────────────
  describe('projectStatusDistribution', () => {
    it('includes all ProjectStatus values (missing ones default to 0)', async () => {
      setupMocks({
        groupBy: [{ status: ProjectStatus.ACTIVE, _count: { _all: 3 } }],
      });
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);

      expect(data.projectStatusDistribution).toHaveLength(Object.values(ProjectStatus).length);

      const active = data.projectStatusDistribution.find((d) => d.status === 'Active');
      expect(active?.count).toBe(3);

      const draft = data.projectStatusDistribution.find((d) => d.status === 'Draft');
      expect(draft?.count).toBe(0);
    });
  });

  // ─── upcomingMilestone ───────────────────────
  describe('upcomingMilestone', () => {
    it('returns null when none exist', async () => {
      setupMocks();
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.upcomingMilestone).toBeNull();
    });

    it('returns title, dueDate, projectName when milestone found', async () => {
      const due = new Date('2099-01-01');
      setupMocks({
        upcomingMilestone: {
          title: 'Beta Launch',
          dueDate: due,
          project: { name: 'SyncLancer' },
        },
      });
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.upcomingMilestone).toMatchObject({
        title: 'Beta Launch',
        projectName: 'SyncLancer',
        dueDate: due,
      });
    });
  });

  // ─── recentActivities ────────────────────────
  describe('recentActivities', () => {
    it('returns at most 5 activities', async () => {
      const now = new Date();
      setupMocks({
        activityInvoices: Array.from({ length: 5 }, (_, i) => ({
          id: `inv-${i}`,
          invoiceNumber: `INV-00${i}`,
          status: InvoiceStatus.DRAFT,
          updatedAt: new Date(now.getTime() - i * 1000),
          client: { companyName: `Client ${i}` },
        })),
      });
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      expect(data.recentActivities.length).toBeLessThanOrEqual(5);
    });

    it('activities are sorted by date descending', async () => {
      const now = new Date();
      setupMocks({
        activityInvoices: [
          { id: 'i1', invoiceNumber: 'INV-001', status: InvoiceStatus.DRAFT, updatedAt: new Date(now.getTime() - 3000), client: { companyName: 'A' } },
          { id: 'i2', invoiceNumber: 'INV-002', status: InvoiceStatus.DRAFT, updatedAt: new Date(now.getTime() - 1000), client: { companyName: 'B' } },
        ],
      });
      const data = await service.getWorkspaceDashboardData(WORKSPACE_ID, USER_ID);
      const dates = data.recentActivities.map((a) => a.date.getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
      }
    });
  });
});
