'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Workspace } from '@prisma/client';
import {
  SquaresFour,
  Users,
  FileText,
  Kanban,
  Receipt,
  FolderOpen,
  ChartBar,
  Gear,
  MagnifyingGlass,
  List,
  X,
  User as UserIcon,
  Square,
} from '@phosphor-icons/react';
import { WorkspaceSwitcher } from './workspace-switcher';
import { CommandPalette } from './command-palette';
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

    // Sync from local storage change events or regular 1s interval
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

  // Close mobile menu on route change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Listen for Ctrl+K globally
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
    { name: 'Dashboard', href: `/${workspaceSlug}/portal`, icon: SquaresFour },
    { name: 'Invoices', href: `/${workspaceSlug}/portal/invoices`, icon: Receipt },
    { name: 'Files', href: `/${workspaceSlug}/portal/files`, icon: FolderOpen },
  ];

  const adminGroups = [
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', href: `/${workspaceSlug}`, icon: SquaresFour },
        { name: 'Clients', href: `/${workspaceSlug}/clients`, icon: Users },
        { name: 'Proposals', href: `/${workspaceSlug}/proposals`, icon: FileText },
        { name: 'Projects', href: `/${workspaceSlug}/projects`, icon: Kanban },
      ],
    },
    {
      title: 'Finance & Assets',
      items: [
        { name: 'Invoices', href: `/${workspaceSlug}/invoices`, icon: Receipt },
        { name: 'Files', href: `/${workspaceSlug}/files`, icon: FolderOpen },
        { name: 'Analytics', href: `/${workspaceSlug}/analytics`, icon: ChartBar },
      ],
    },
    {
      title: 'Management',
      items: [
        { name: 'Settings', href: `/${workspaceSlug}/settings`, icon: Gear },
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
        <div className="space-y-1.5 px-3 py-4">
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-550 uppercase">
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
                  "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-primary font-semibold"
                    : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute inset-0 rounded-md bg-sidebar-accent border-l-[3px] border-sidebar-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon weight={active ? "fill" : "regular"} className={cn("h-5 w-5 shrink-0 transition-transform duration-200 relative z-10", active ? "text-primary" : "text-zinc-400 dark:text-zinc-500")} />
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
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-550 uppercase">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "text-primary font-semibold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute inset-0 rounded-md bg-sidebar-accent border-l-[3px] border-sidebar-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon weight={active ? "fill" : "regular"} className={cn("h-5 w-5 shrink-0 relative z-10", active ? "text-primary" : "text-muted-foreground")} />
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
      {/* Switcher Section - Workspace Card height exactly 72px */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 h-[72px] flex items-center px-4">
        {isClient ? (
          <div className="flex h-11 items-center px-2">
            <span className="text-xs font-black tracking-wider uppercase text-primary">
              Client Portal
            </span>
          </div>
        ) : (
          <WorkspaceSwitcher currentWorkspace={currentWorkspace} workspaces={workspaces} />
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto pt-2">{renderNavLinks()}</nav>

      {/* User profile & Logout */}
      <div className="border-t border-zinc-200/60 dark:border-zinc-800/60 p-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold font-heading">
            {userName ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col overflow-hidden text-xs">
            <span className="font-semibold truncate text-zinc-900 dark:text-zinc-50">
              {userName || 'User'}
            </span>
            <span className="text-[10px] text-zinc-400 truncate dark:text-zinc-500">
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
      {/* Desktop Sidebar (Permanent) - Floating Glass panel */}
      <aside className="fixed left-0 top-0 bottom-0 z-20 hidden w-60 border-r border-sidebar-border bg-sidebar shadow-sm md:flex md:flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (Collapsible/Drawer Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex w-[260px] max-w-xs flex-col border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer outline-none"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full pt-2">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      {/* Main Content Area Wrapper */}
      <div className="flex flex-1 flex-col md:pl-60 min-h-screen">
        {/* Top Header - exactly 64px height (h-16) */}
        <header className="sticky top-0 z-10 flex h-16 border-b border-border bg-card px-6 items-center justify-between w-full">
          <div className="flex flex-1 items-center justify-between">
            {/* Left section: Hamburger (mobile) + Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <List className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="text-muted-foreground font-normal">SyncLancer</span>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[120px] md:max-w-none">
                  {isClient ? 'Client Portal' : currentWorkspace.name}
                </span>
              </div>
            </div>

            {/* Right section: Global search (320px), Notification Center, User Avatar */}
            <div className="flex items-center gap-4">
              {/* Desktop header search bar trigger - exactly 320px width */}
              <div className="relative hidden md:block w-[320px]">
                <MagnifyingGlass className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-muted/50 pl-8 pr-3 text-left text-xs text-muted-foreground transition-colors hover:bg-muted cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring font-medium"
                >
                  <span>Search workspace...</span>
                  <kbd className="pointer-events-none font-mono text-[9px] text-zinc-400">Ctrl K</kbd>
                </button>
              </div>

              {/* Quick Actions Search button for mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer outline-none md:hidden"
              >
                <MagnifyingGlass className="h-4 w-4" />
              </button>

              {/* Notification Center */}
              {notificationCenter}

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - exactly 24px (p-6) outer padding, max 1440px width */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Command Palette search dialog */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        workspaceSlug={workspaceSlug}
        isClient={isClient}
      />

      {/* Floating Active Timer Panel */}
      {activeTimer && (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-lg border border-primary/30 bg-slate-950 text-white p-4 shadow-lg animate-in slide-in-from-bottom duration-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
            <span className="h-3.5 w-3.5 rounded-full bg-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active Timer</span>
            <span className="text-xs font-semibold truncate text-zinc-100">{activeTimer.projectName}</span>
            <span className="text-[10px] text-slate-400 truncate mt-0.5">{activeTimer.notes || 'No description'}</span>
          </div>
          <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
            <span className="text-sm font-mono font-bold tracking-tight text-white">{formatTime(elapsed)}</span>
            <button
              onClick={handleStopFloatingTimer}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 cursor-pointer transition-colors"
              title="Stop Timer"
            >
              <Square weight="fill" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
