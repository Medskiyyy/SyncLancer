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
  'Draft': '#78716c',      // stone-500
  'Active': '#eab308',     // primary gold
  'On Hold': '#F59E0B',    // warning amber
  'Review': '#a855f7',     // violet-500
  'Completed': '#10B981',  // success emerald
  'Cancelled': '#EF4444',  // danger red
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-premium-md dark:border-zinc-800/80 dark:bg-zinc-950/95 backdrop-blur-md text-xs">
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
      <div className="flex flex-col items-center justify-center h-[360px] text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 p-6 min-h-[360px]">
        <FolderKanban className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3 shrink-0" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No projects data yet</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] mb-4">
          Create your first project to start managing tasks, milestones, and time entries.
        </p>
        <Link href={`/${workspaceSlug}/projects/new`}>
          <Button size="sm" variant="default" className="font-medium text-xs rounded-lg px-3.5 h-8 cursor-pointer">
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
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(122, 117, 109, 0.05)' }} />
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
