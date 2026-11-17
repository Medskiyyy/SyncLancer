'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Workspace } from '@prisma/client';
import {
  LayoutGrid,
  Users,
  FileText,
  FolderKanban,
  Receipt,
  FolderOpen,
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  GitBranch,
  Square,
} from 'lucide-react';
import { WorkspaceSwitcher } from './workspace-switcher';
import { CommandPalette } from './command-palette';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createTimeEntryAction } from '@/features/time-tracking/actions/time-entry-actions';

interface SidebarNavProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  isClient: boolean;
  workspaceSlug: string;
  userEmail: string;
  userName: string;
  logoutButton: React.ReactNode;
  notificationCenter: React.ReactNode;
  children: React.ReactNode;
}

interface ActiveTimer {
  projectId: string;
  taskId?: string | null;
  startTime: string;
  billable: boolean;
  notes?: string;
  projectName: string;
}

export function SidebarNav({
  currentWorkspace,
  workspaces,
  isClient,
  workspaceSlug,
  userEmail,
  userName,
  logoutButton,
  notificationCenter,
  children,
}: SidebarNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [activeTimer, setActiveTimer] = React.useState<ActiveTimer | null>(null);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const timerStorageKey = `@synclancer/active-timer-${currentWorkspace.id}`;

    const checkTimer = () => {
      const stored = localStorage.getItem(timerStorageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as ActiveTimer;
          setActiveTimer(parsed);
          const start = new Date(parsed.startTime).getTime();
          setElapsed(Math.floor((Date.now() - start) / 1000));
        } catch {
          localStorage.removeItem(timerStorageKey);
        }
      } else {
        setActiveTimer(null);
      }
    };

    checkTimer();

    const interval = setInterval(checkTimer, 1000);
    window.addEventListener('storage', checkTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkTimer);
    };
  }, [currentWorkspace.id]);

  const handleStopFloatingTimer = async () => {
    if (!activeTimer) return;
    const timerStorageKey = `@synclancer/active-timer-${currentWorkspace.id}`;
    try {
      const endTime = new Date();
      const startTime = new Date(activeTimer.startTime);
      const diffMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.max(1, Math.round(diffMs / 60000));

      const res = await createTimeEntryAction(currentWorkspace.id, {
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        startTime,
        endTime,
        durationMinutes,
        billable: activeTimer.billable,
        notes: activeTimer.notes || 'Timer log (floating)',
      });

      if (res.success) {
        toast.success('Time entry logged successfully');
        localStorage.removeItem(timerStorageKey);
        setActiveTimer(null);
        window.dispatchEvent(new Event('storage'));
      } else {
        toast.error(res.error || 'Failed to save time entry');
      }
    } catch {
      toast.error('Failed to stop timer');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clientNavItems = [
    { name: 'Dashboard', href: `/${workspaceSlug}/portal`, icon: LayoutGrid },
    { name: 'Invoices', href: `/${workspaceSlug}/portal/invoices`, icon: Receipt },
    { name: 'Files', href: `/${workspaceSlug}/portal/files`, icon: FolderOpen },
  ];

  const adminGroups = [
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', href: `/${workspaceSlug}`, icon: LayoutGrid },
        { name: 'CRM Pipeline', href: `/${workspaceSlug}/crm`, icon: GitBranch },
        { name: 'Clients', href: `/${workspaceSlug}/clients`, icon: Users },
        { name: 'Proposals', href: `/${workspaceSlug}/proposals`, icon: FileText },
        { name: 'Projects', href: `/${workspaceSlug}/projects`, icon: FolderKanban },
      ],
    },
    {
      title: 'Finance & Assets',
      items: [
        { name: 'Invoices', href: `/${workspaceSlug}/invoices`, icon: Receipt },
        { name: 'Files', href: `/${workspaceSlug}/files`, icon: FolderOpen },
        { name: 'Analytics', href: `/${workspaceSlug}/analytics`, icon: BarChart3 },
      ],
    },
    {
      title: 'Management',
      items: [
        { name: 'Settings', href: `/${workspaceSlug}/settings`, icon: Settings },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === `/${workspaceSlug}` || href === `/${workspaceSlug}/portal`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = () => {
    if (isClient) {
      return (
        <div className="space-y-1 px-3 py-4">
          <div className="px-3 mb-1.5 text-[11px] font-medium text-muted-foreground">
            Client Portal
          </div>
          {clientNavItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'text-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-md bg-sidebar-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  >
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />
                  </motion.div>
                )}
                <Icon
                  className={cn(
                    'relative z-10 h-4 w-4 shrink-0',
                    active ? 'text-brand' : 'text-muted-foreground'
                  )}
                  strokeWidth={1.75}
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-5 px-3 py-4">
        {adminGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 mb-1.5 text-[11px] font-medium text-muted-foreground">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'text-foreground font-semibold'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute inset-0 rounded-md bg-sidebar-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      >
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-brand" />
                      </motion.div>
                    )}
                    <Icon
                      className={cn(
                        'relative z-10 h-4 w-4 shrink-0',
                        active ? 'text-brand' : 'text-muted-foreground'
                      )}
                      strokeWidth={1.75}
                    />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex h-[72px] items-center border-b border-sidebar-border px-4">
        {isClient ? (
          <div className="flex items-center gap-2.5 px-1">
            <BrandLogo showWordmark={false} />
            <span className="font-heading text-sm font-bold text-foreground">
              Client Portal
            </span>
          </div>
        ) : (
          <WorkspaceSwitcher currentWorkspace={currentWorkspace} workspaces={workspaces} />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto pt-1">{renderNavLinks()}</nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-foreground text-xs font-bold font-heading text-background">
            {userName ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col overflow-hidden text-xs">
            <span className="truncate font-semibold text-foreground">
              {userName || 'User'}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {userEmail}
            </span>
          </div>
        </div>
        {logoutButton}
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 z-20 hidden w-60 border-r border-sidebar-border bg-sidebar shadow-none md:flex md:flex-col">
        {renderSidebarContent()}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative flex w-[260px] max-w-xs flex-col border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer outline-none"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full pt-2">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col md:pl-60 min-h-[100dvh]">
        <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex min-w-0 items-center gap-1.5 text-sm">
                <span className="hidden text-muted-foreground sm:inline">SyncLancer</span>
                <span className="hidden text-border sm:inline">/</span>
                <span className="truncate font-heading font-semibold text-foreground md:max-w-none">
                  {isClient ? 'Client Portal' : currentWorkspace.name}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block w-[240px] lg:w-[280px]">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex h-8 w-full items-center justify-between rounded-md border border-border bg-secondary/60 pl-8 pr-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>Search workspace...</span>
                  <kbd className="pointer-events-none font-mono text-[11px] text-muted-foreground">Ctrl K</kbd>
                </button>
              </div>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer outline-none md:hidden"
              >
                <Search className="h-4 w-4" />
              </button>

              <ThemeToggle />

              {notificationCenter}

              {!isClient && (
                <Link
                  href={`/${workspaceSlug}/settings`}
                  title="Workspace settings"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] min-w-0 flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        workspaceSlug={workspaceSlug}
        isClient={isClient}
      />

      {activeTimer && (
        <div className="fixed bottom-4 right-4 left-4 z-50 flex items-center gap-3.5 rounded-lg border border-border bg-card p-3.5 text-foreground shadow-lg animate-in slide-in-from-bottom duration-200 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary border border-border">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[11px] font-medium text-brand">Active timer</span>
            <span className="truncate text-xs font-semibold text-foreground">{activeTimer.projectName}</span>
            <span className="mt-0.5 truncate text-[11px] text-muted-foreground">{activeTimer.notes || 'No description'}</span>
          </div>
          <div className="flex items-center gap-3 border-l border-border pl-3">
            <span className="font-mono text-sm font-bold tabular-nums tracking-tight text-foreground">{formatTime(elapsed)}</span>
            <button
              onClick={handleStopFloatingTimer}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 cursor-pointer"
              title="Stop Timer"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
