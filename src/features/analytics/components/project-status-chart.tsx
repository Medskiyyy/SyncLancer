'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FolderKanban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';

interface ProjectStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  Draft: '#a3a39e',
  Active: 'var(--brand)',
  'On Hold': '#d97706',
  Review: '#52524e',
  Completed: 'var(--foreground)',
  Cancelled: '#dc2626',
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-lg">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="mt-1 font-mono font-bold tabular-nums text-brand">
          {payload[0].value} {payload[0].value === 1 ? 'Project' : 'Projects'}
        </p>
      </div>
    );
  }
  return null;
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const hasData = data && data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[260px] min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center sm:h-[360px] sm:min-h-[360px]">
        <FolderKanban className="mb-3 h-8 w-8 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <h4 className="mb-1 text-sm font-semibold text-foreground">No projects data yet</h4>
        <p className="mb-4 max-w-[240px] text-xs text-muted-foreground">
          Create your first project to start managing tasks, milestones, and time entries.
        </p>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button size="sm" variant="default">
            Create Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full sm:h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -30,
            bottom: 0,
          }}
          barSize={24}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-50" />
          <XAxis
            dataKey="status"
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || 'var(--foreground)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
