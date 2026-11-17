import Link from 'next/link';
import { Check } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';

const HIGHLIGHTS = [
  'CRM leads convert cleanly into active client profiles and PDF proposals',
  'Milestones, Kanban tasks, and billable hours stay synced per project',
  'Dedicated client portal for deliverables, milestones, and invoices',
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] grid-cols-1 bg-background text-foreground lg:grid-cols-12">
      <aside className="hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between border-r border-border bg-secondary/50 p-10 xl:p-12">
        <div>
          <Link href="/" className="inline-flex items-center">
            <BrandLogo />
          </Link>
        </div>

        <div className="max-w-md space-y-6">
          <h2 className="font-heading text-3xl font-bold tracking-tight leading-tight text-foreground">
            Run client pipelines, delivery, and billing from one ledger.
          </h2>

          <ul className="space-y-3.5 text-sm text-muted-foreground">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">
          SyncLancer Workspace · Built for independent studios
        </div>
      </aside>

      <div className="col-span-12 flex flex-col justify-between p-6 sm:p-10 lg:col-span-7">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo />
            </Link>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-[380px] py-8">
          {children}
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
