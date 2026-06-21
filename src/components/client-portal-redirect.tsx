'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ClientPortalRedirectProps {
  workspaceSlug: string;
  role: string;
}

export function ClientPortalRedirect({ workspaceSlug, role }: ClientPortalRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (role === 'CLIENT') {
      const portalPath = `/${workspaceSlug}/portal`;
      if (!pathname.startsWith(portalPath)) {
        router.push(portalPath);
      }
    }
  }, [pathname, role, workspaceSlug, router]);

  return null;
}
