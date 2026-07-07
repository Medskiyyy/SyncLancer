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
  'Draft': '#64748b',
  'Active': '#2563eb',
  'On Hold': '#d97706',
  'Review': '#8b5cf6',
  'Completed': '#059669',
  'Cancelled': '#dc2626',
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
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{label}</p>
        <p className="mt-1 font-bold text-primary dark:text-primary">
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
      <div className="flex min-h-[360px] h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
        <FolderKanban className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3 shrink-0" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No projects data yet</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] mb-4">
          Create your first project to start managing tasks, milestones, and time entries.
        </p>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button size="sm" variant="default" className="font-medium text-xs rounded-md px-3.5 h-8 cursor-pointer">
            Create Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full">
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-40" />
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || 'var(--primary)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
