import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function BrandLogo({ className, showWordmark = true }: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-foreground text-background"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <rect x="4" y="6" width="12" height="3.2" rx="1" fill="currentColor" />
          <rect x="8" y="14.8" width="12" height="3.2" rx="1" fill="currentColor" />
          <rect x="16.5" y="6" width="3.5" height="3.5" rx="0.8" fill="var(--brand)" />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-heading text-base font-bold tracking-tight text-foreground">
          SyncLancer
        </span>
      )}
    </span>
  );
}
