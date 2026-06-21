import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await auth();

  // Safeguard if middleware is bypassed
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">SyncLancer Onboarding</CardTitle>
          <CardDescription>
            You are logged in as <span className="font-semibold text-foreground">{session.user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-medium">Welcome, {session.user.name}!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              The project shell and Authentication (Phase 2) are fully functional. Up next, we will build the Workspace System (Phase 3).
            </p>
          </div>

          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button type="submit" variant="destructive" className="w-full">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
