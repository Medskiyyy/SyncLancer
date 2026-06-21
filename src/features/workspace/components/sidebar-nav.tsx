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
  children: React.ReactNode;
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
                  "relative flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-all duration-150 cursor-pointer outline-none",
                  active
                    ? "bg-[#EEF4FF] text-[#1D4ED8] dark:bg-zinc-800 dark:text-zinc-550 font-bold border-l-[3px] border-[#2563EB] rounded-l-none"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", active ? "text-[#2563EB]" : "text-zinc-400 dark:text-zinc-500")} />
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
                      "relative flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-all duration-150 cursor-pointer outline-none",
                      active
                        ? "bg-[#EEF4FF] text-[#1D4ED8] dark:bg-zinc-800 dark:text-zinc-550 font-bold border-l-[3px] border-[#2563EB] rounded-l-none"
                        : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform duration-200", active ? "text-[#2563EB]" : "text-zinc-400 dark:text-zinc-500")} />
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
      {/* Switcher Section - Workspace Card height exactly 72px */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 h-[72px] flex items-center px-4">
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
      {/* Desktop Sidebar (Permanent) - fixed 260px */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[260px] border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:flex-col">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer (Collapsible/Drawer Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex w-[260px] max-w-xs flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-250">
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

      {/* Main Content Area Wrapper */}
      <div className="flex flex-1 flex-col md:pl-[260px] min-h-screen">
        {/* Top Header - exactly 64px height (h-16) */}
        <header className="sticky top-0 z-10 flex h-16 border-b border-zinc-200 bg-white/90 backdrop-blur-md px-6 dark:border-zinc-800 dark:bg-zinc-900/90 items-center justify-between w-full">
          <div className="flex flex-1 items-center justify-between">
            {/* Left section: Hamburger (mobile) + Page Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-1.5 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden cursor-pointer outline-none"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="text-zinc-500 dark:text-zinc-400 font-normal">SyncLancer</span>
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
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-450" />
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex h-9 w-full items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-left text-xs text-zinc-450 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer outline-none font-medium"
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
                <Search className="h-4 w-4" />
              </button>

              {/* Notification Center */}
              {notificationCenter}

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
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
    </>
  );
}
