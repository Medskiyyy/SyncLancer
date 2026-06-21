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
import { ChevronsUpDown, Plus, Sparkles } from 'lucide-react';

interface WorkspaceSwitcherProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
}

export function WorkspaceSwitcher({ currentWorkspace, workspaces }: WorkspaceSwitcherProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex w-full items-center justify-between gap-2.5 whitespace-nowrap rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 px-3 py-2 text-left text-sm font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20 text-xs shadow-xs">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="font-semibold truncate text-zinc-900 dark:text-zinc-50 text-xs">
              {currentWorkspace.name}
            </span>
            <span className="text-[10px] text-zinc-400 truncate dark:text-zinc-500 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-500" />
              <span>Free tier</span>
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl" align="start">
        <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          Workspaces
        </div>
        <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => router.push(`/${ws.slug}`)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-350 text-[10px] font-bold border border-zinc-200/50 dark:border-zinc-700/50">
                {ws.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium text-zinc-750 dark:text-zinc-300">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1 border-t border-zinc-150 dark:border-zinc-800" />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="font-medium">Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
