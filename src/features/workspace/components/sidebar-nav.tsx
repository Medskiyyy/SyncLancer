'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Workspace } from '@prisma/client';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  Receipt,
  FolderOpen,
  BarChart3,
  Settings,
  Search,
  Workflow,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';
import { WorkspaceSwitcher } from './workspace-switcher';
import { CommandPalette } from './command-palette';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  isClient: boolean;
  workspaceSlug: string;
  userEmail: string;
  userName: string;
  logoutButton: React.ReactNode;
  notificationCenter: React.ReactNode;
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
}: SidebarNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
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
    { name: 'Dashboard', href: `/${workspaceSlug}/portal`, icon: LayoutDashboard },
    { name: 'Invoices', href: `/${workspaceSlug}/portal/invoices`, icon: Receipt },
    { name: 'Files', href: `/${workspaceSlug}/portal/files`, icon: FolderOpen },
  ];

  const adminGroups = [
    {
      title: 'Workspace',
      items: [
        { name: 'Dashboard', href: `/${workspaceSlug}`, icon: LayoutDashboard },
        { name: 'CRM', href: `/${workspaceSlug}/crm`, icon: Workflow },
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
        <div className="space-y-1.5 px-3 py-4">
          <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
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
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer outline-none",
                  active
                    ? "bg-zinc-150 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-xs border-l-2 border-primary rounded-l-none"
                    : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", active ? "text-primary" : "text-zinc-400 dark:text-zinc-500")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <div className="space-y-6 px-3 py-4">
        {adminGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
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
                      "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer outline-none",
                      active
                        ? "bg-zinc-150 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 font-semibold shadow-xs border-l-2 border-primary rounded-l-none"
                        : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-200", active ? "text-primary font-bold" : "text-zinc-400 dark:text-zinc-500")} />
                    <span>{item.name}</span>
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
    <div className="flex h-full flex-col bg-white dark:bg-zinc-900">
      {/* Switcher Section */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
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

      {/* Search trigger button */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:bg-zinc-950 cursor-pointer outline-none"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-zinc-400" />
            <span>Search workspace...</span>
          </div>
          <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500 sm:flex">
            <span>Ctrl K</span>
          </kbd>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto pt-2">{renderNavLinks()}</nav>

      {/* User profile & Logout */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <UserIcon className="h-4 w-4" />
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
      {/* Desktop Sidebar (Permanent) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (Absolute overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex w-64 max-w-xs flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-250">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-50 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer outline-none"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="h-full pt-2">{renderSidebarContent()}</div>
          </div>
        </div>
      )}

      {/* Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-10 flex h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 dark:border-zinc-800 dark:bg-zinc-900/80 md:px-6">
        <div className="flex flex-1 items-center justify-between">
          {/* Left section: Hamburger (mobile) or Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-1.5 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden cursor-pointer outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium">
              <span className="text-zinc-500 dark:text-zinc-400">SyncLancer</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[120px] md:max-w-none">
                {isClient ? 'Client Portal' : currentWorkspace.name}
              </span>
            </div>
          </div>

          {/* Right section: Global search, Notification Center, User Info */}
          <div className="flex items-center gap-3">
            {/* Quick Actions Search button for mobile / small desktop */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer outline-none md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Desktop header search bar trigger */}
            <div className="relative hidden md:block w-48 lg:w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-left text-xs text-zinc-400 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer outline-none"
              >
                <span>Search dashboard...</span>
                <kbd className="pointer-events-none font-mono text-[9px] text-zinc-400">⌘K</kbd>
              </button>
            </div>

            {/* Notification Center from Server Component */}
            {notificationCenter}

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
              <UserIcon className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette search dialog */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        workspaceSlug={workspaceSlug}
        isClient={isClient}
      />
    </>
  );
}
