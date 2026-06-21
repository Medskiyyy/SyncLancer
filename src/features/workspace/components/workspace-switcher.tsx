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

  const isPro = currentWorkspace.plan === 'PRO';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-xl border border-zinc-200/80 bg-zinc-50/40 px-3 py-2 text-left text-sm transition-all hover:bg-zinc-50 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-primary/40 h-14"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Workspace Avatar: exactly 40x40 */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1D4ED8] dark:bg-zinc-800 dark:text-blue-400 font-bold border border-blue-100 dark:border-zinc-700 text-sm shadow-xs">
            {currentWorkspace.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            {/* Workspace Name: exactly 16px (text-base), 600 weight */}
            <span className="font-semibold truncate text-zinc-900 dark:text-zinc-50 text-base leading-tight">
              {currentWorkspace.name}
            </span>
            {/* Plan Badge: exactly 12px (text-xs), 500 weight */}
            <span className="text-xs font-medium text-zinc-500 truncate dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              <span>{isPro ? 'Pro plan' : 'Free tier'}</span>
            </span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-550" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl" align="start">
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
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-350 text-[10px] font-bold border border-zinc-200/50 dark:border-zinc-700/50">
                {ws.name.substring(0, 2).toUpperCase()}
              </div>
              <span className="truncate font-medium text-zinc-750 dark:text-zinc-300">{ws.name}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1 border-t border-zinc-150 dark:border-zinc-800" />
        <DropdownMenuItem
          onClick={() => router.push('/onboarding')}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs text-primary font-semibold"
        >
          <Plus className="h-4 w-4" />
          <span>Create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
