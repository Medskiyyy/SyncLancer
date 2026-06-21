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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2 py-6 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer outline-none"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-sm">
            <span className="font-semibold truncate text-zinc-900 dark:text-zinc-50">{currentWorkspace.name}</span>
            <span className="text-xs text-muted-foreground truncate">Free Plan</span>
          </div>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Workspaces</div>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => router.push(`/${ws.slug}`)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-bold">
              {ws.name.substring(0, 2).toUpperCase()}
            </div>
            <span className="truncate">{ws.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 cursor-pointer text-primary"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
