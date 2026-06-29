'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number }>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-premium-md dark:border-zinc-800/80 dark:bg-zinc-950/95 backdrop-blur-md text-xs">
        <p className="font-semibold text-zinc-900 dark:text-zinc-50">{label}</p>
        <p className="mt-1 font-bold text-primary dark:text-primary">
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
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const isEmpty = !data || data.length === 0 || data.every((d) => d.revenue === 0);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-[360px] text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 p-6 min-h-[360px]">
        <Receipt className="h-10 w-10 text-zinc-400 dark:text-zinc-600 mb-3 shrink-0" />
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">No revenue data yet</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px] mb-4">
          Create your first invoice to start tracking revenue.
        </p>
        <Link href={`/${workspaceSlug}/invoices`}>
          <Button size="sm" variant="default" className="font-medium text-xs rounded-lg px-3.5 h-8 cursor-pointer">
            Create Invoice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[360px] w-full">
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
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-40" />
          <XAxis
            dataKey="name"
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
            tickFormatter={(value) => `$${value}`}
            dx={-4}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(234, 179, 8, 0.12)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            activeDot={{ r: 5, stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--card)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
