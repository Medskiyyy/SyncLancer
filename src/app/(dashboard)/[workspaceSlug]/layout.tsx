import { auth, signOut } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { SidebarNav } from '@/features/workspace/components/sidebar-nav';
import { ClientPortalRedirect } from '@/components/client-portal-redirect';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

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

  let membership;
  try {
    // Validate if the logged-in user is a member of this workspace
    membership = await workspaceService.validateWorkspaceAccess(currentWorkspace.id, session.user.id);
  } catch (error) {
    redirect('/');
  }

  const isClient = membership.role === 'CLIENT';
  const workspaces = await workspaceService.getUserWorkspaces(session.user.id);

  const logoutButton = (
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
        className="flex w-full items-center justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {isClient && (
        <ClientPortalRedirect
          workspaceSlug={workspaceSlug}
          role="CLIENT"
        />
      )}
      
      {/* Sidebar & Header Component */}
      <SidebarNav
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        isClient={isClient}
        workspaceSlug={workspaceSlug}
        userEmail={session.user.email || ''}
        userName={session.user.name || ''}
        logoutButton={logoutButton}
        notificationCenter={<NotificationCenter />}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

