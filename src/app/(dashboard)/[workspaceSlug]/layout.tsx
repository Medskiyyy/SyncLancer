import { auth, signOut } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';
import { SidebarNav } from '@/features/workspace/components/sidebar-nav';
import { ClientPortalRedirect } from '@/components/client-portal-redirect';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { PageTransitionProvider } from '@/app/providers/page-transition-provider';
import { Button } from '@/components/ui/button';
import { SignOut } from '@phosphor-icons/react/dist/ssr';

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
        className="flex w-full items-center justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer font-semibold"
      >
        <SignOut className="h-4 w-4" />
        <span>Log Out</span>
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {isClient && (
        <ClientPortalRedirect
          workspaceSlug={workspaceSlug}
          role="CLIENT"
        />
      )}
      
      <SidebarNav
        currentWorkspace={currentWorkspace}
        workspaces={workspaces}
        isClient={isClient}
        workspaceSlug={workspaceSlug}
        userEmail={session.user.email || ''}
        userName={session.user.name || ''}
        logoutButton={logoutButton}
        notificationCenter={<NotificationCenter />}
      >
        <PageTransitionProvider>
          {children}
        </PageTransitionProvider>
      </SidebarNav>
    </div>
  );
}
