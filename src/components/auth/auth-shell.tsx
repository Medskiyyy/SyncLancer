import Link from 'next/link';
import { Layers } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" strokeWidth={2} />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            SyncLancer
          </span>
        </Link>
      </div>
      {children}
    </div>
  );
}
