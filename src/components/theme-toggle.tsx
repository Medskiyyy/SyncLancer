'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle color theme"
      title="Toggle theme"
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <Sun className="h-4 w-4 hidden dark:block" strokeWidth={1.75} />
      <Moon className="h-4 w-4 block dark:hidden" strokeWidth={1.75} />
    </button>
  );
}
