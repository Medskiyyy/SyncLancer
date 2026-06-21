'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number }>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-md dark:border-zinc-800 dark:bg-zinc-950/95 backdrop-blur-xs text-xs">
        <p className="font-semibold text-zinc-900 dark:text-zinc-55">{label}</p>
        <p className="mt-1 font-bold text-amber-600 dark:text-amber-400">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" className="dark:stroke-zinc-800/40" />
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `$${value}`}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(202, 138, 4, 0.15)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ca8a04" // Gold theme color
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            activeDot={{ r: 5, stroke: '#ca8a04', strokeWidth: 2, fill: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
