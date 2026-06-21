import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { WorkspaceService } from '@/features/workspace/services/workspace-service';

const workspaceService = new WorkspaceService();

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login');
  }

  const workspaces = await workspaceService.getUserWorkspaces(session.user.id);

  if (workspaces.length > 0) {
    // Redirect to the first available workspace dashboard
    redirect(`/${workspaces[0].slug}`);
  } else {
    // Redirect to onboarding to create the first workspace
    redirect('/onboarding');
  }
}
