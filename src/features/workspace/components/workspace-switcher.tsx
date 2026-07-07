'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Workspace } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, ChevronsUpDown, Plus } from 'lucide-react';

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({ currentWorkspace, workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();

  const isPro = currentWorkspace.plan === 'PRO';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-14 w-full items-center justify-between gap-3 whitespace-nowrap rounded-md border border-border bg-muted/50 px-3 py-2 text-left text-sm transition-colors hover:bg-muted cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Workspace Avatar: exactly 40x40 */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            {/* Workspace Name: exactly 16px (text-base), 600 weight */}
            <span className="font-semibold truncate text-zinc-900 dark:text-zinc-50 text-base leading-tight">
              {currentWorkspace.name}
            </span>
            {/* Plan Badge: exactly 12px (text-xs), 500 weight */}
            <span className="text-xs font-medium text-muted-foreground truncate flex items-center gap-1 mt-0.5">
              <span>{isPro ? 'Pro plan' : 'Free tier'}</span>
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-1 bg-popover border border-border rounded-md shadow-lg" align="start">
        <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Workspaces
        </div>
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => router.push(`/${ws.slug}`)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted cursor-pointer text-xs"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-bold text-muted-foreground">
                {ws.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium text-popover-foreground">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1 border-t border-border" />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-muted cursor-pointer text-xs text-primary font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
