import { auth, signOut } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { WorkspaceSwitcher } from '@/features/workspace/components/workspace-switcher';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  Receipt,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  User as UserIcon,
  Search,
  Bell,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const workspaceService = new WorkspaceService();

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { workspaceSlug } = await params;
  const currentWorkspace = await workspaceService.getWorkspaceBySlug(workspaceSlug);
  if (!currentWorkspace) {
    notFound();
  }

  try {
    // Validate if the logged-in user is a member of this workspace
    await workspaceService.validateWorkspaceAccess(currentWorkspace.id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  const workspaces = await workspaceService.getUserWorkspaces(session.user.id);

  const navItems = [
    { name: 'Dashboard', href: `/${workspaceSlug}`, icon: LayoutDashboard },
    { name: 'CRM', href: `/${workspaceSlug}/crm`, icon: Workflow },
    { name: 'Clients', href: `/${workspaceSlug}/clients`, icon: Users },
    { name: 'Proposals', href: `/${workspaceSlug}/proposals`, icon: FileText },
    { name: 'Projects', href: `/${workspaceSlug}/projects`, icon: FolderKanban },
    { name: 'Invoices', href: `/${workspaceSlug}/invoices`, icon: Receipt },
    { name: 'Files', href: `/${workspaceSlug}/files`, icon: FolderOpen },
    { name: 'Analytics', href: `/${workspaceSlug}/analytics`, icon: BarChart3 },
    { name: 'Settings', href: `/${workspaceSlug}/settings`, icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar Desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex md:flex-col">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <WorkspaceSwitcher currentWorkspace={currentWorkspace} workspaces={workspaces} />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 flex h-14 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 md:px-6">
          <div className="flex flex-1 items-center justify-between">
            {/* Left section: Breadcrumb placeholder */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">SyncLancer</span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Workspace</span>
            </div>

            {/* Right section: Actions */}
            <div className="flex items-center gap-4">
              <div className="relative hidden max-w-xs md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                <input
                  type="search"
                  placeholder="Global search..."
                  className="h-9 w-60 rounded-md border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
