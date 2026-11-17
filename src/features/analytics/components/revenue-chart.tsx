'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number }>;
}

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
      <div className="flex h-[260px] min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/40 p-6 text-center sm:h-[360px] sm:min-h-[360px]">
        <Receipt className="mb-3 h-8 w-8 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <h4 className="mb-1 text-sm font-semibold text-foreground">No revenue data yet</h4>
        <p className="mb-4 max-w-[240px] text-xs text-muted-foreground">
          Create your first invoice to start tracking revenue.
        </p>
        <Link href={`/${workspaceSlug}/invoices`}>
          <Button size="sm" variant="default">
            Create Invoice
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full sm:h-[360px]">
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
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.14} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" className="opacity-50" />
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
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--brand)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            activeDot={{ r: 5, stroke: 'var(--brand)', strokeWidth: 2, fill: 'var(--card)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
