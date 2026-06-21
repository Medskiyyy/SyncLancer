'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProjectStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  'Draft': '#a8a29e',      // stone-400
  'Active': '#ca8a04',     // gold-600 (Primary)
  'On Hold': '#d97706',    // amber-600
  'Review': '#78716c',     // stone-500
  'Completed': '#16a34a',  // green-600
  'Cancelled': '#dc2626',  // red-600
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-950/95 backdrop-blur-xs text-xs">
        <p className="font-semibold text-zinc-900 dark:text-zinc-55">{label}</p>
        <p className="mt-1 font-bold text-zinc-700 dark:text-zinc-300">
          {payload[0].value} {payload[0].value === 1 ? 'Project' : 'Projects'}
        </p>
      </div>
    );
  }
  return null;
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  // Filter out statuses with 0 projects to keep chart clean if all are empty
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-500 text-sm">
        No projects recorded yet.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800/40" />
          <XAxis
            dataKey="status"
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(120, 113, 108, 0.05)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#ca8a04'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
