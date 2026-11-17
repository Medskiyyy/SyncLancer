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
import { ChevronsUpDown, Plus } from 'lucide-react';

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({ currentWorkspace, workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const isPro = currentWorkspace.plan === 'PRO';
  const monogram = currentWorkspace.name.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-12 w-full items-center justify-between gap-2.5 whitespace-nowrap rounded-md border border-border bg-background px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-foreground font-heading text-xs font-bold text-background">
            {monogram}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="truncate font-heading text-sm font-semibold leading-tight text-foreground">
              {currentWorkspace.name}
            </span>
            <span className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">
              {isPro ? 'Pro plan' : 'Free tier'}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg" align="start">
        <div className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
          Workspaces
        </div>
        <div className="max-h-[200px] space-y-0.5 overflow-y-auto">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => router.push(`/${ws.slug}`)}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs hover:bg-secondary cursor-pointer"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border border-border bg-secondary text-[11px] font-bold text-foreground">
                {ws.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium text-popover-foreground">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1 border-t border-border" />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
        >
          <Plus className="h-4 w-4 text-brand" />
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
