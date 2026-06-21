'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProjectStatusChartProps {
  data: Array<{ status: string; count: number }>;
}

const STATUS_COLORS: Record<string, string> = {
  'Draft': '#94A3B8',      // slate-400
  'Active': '#3B82F6',     // blue-500
  'On Hold': '#F59E0B',    // amber-500
  'Review': '#8B5CF6',     // violet-500
  'Completed': '#10B981',  // emerald-500
  'Cancelled': '#EF4444',  // red-500
};

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  // Filter out statuses with 0 projects to keep chart clean if all are empty
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 dark:text-zinc-650 text-sm">
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
            top: 5,
            right: 10,
            left: -30,
            bottom: 0,
          }}
          barSize={32}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800" />
          <XAxis
            dataKey="status"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E4E4E7',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(228, 228, 230, 0.2)' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#3B82F6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
