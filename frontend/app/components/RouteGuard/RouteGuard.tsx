"use client"
import { useAuth } from '@/app/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  type: 'public' | 'guest-or-user' | 'user-only';
  redirectTo?: string;
  title?: string;
}

export default function RouteGuard({
  children,
  type,
  redirectTo = '/auth/login',
  title
}: RouteGuardProps) {
  const { user, isAuthenticated, isGuest, createGuestSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (type === 'user-only' && !isAuthenticated) {
      router.push(redirectTo);
    }

    if (type === 'guest-or-user' && !isAuthenticated && !isGuest) {
      createGuestSession();
    }
  }, [type, isAuthenticated, isGuest, user, router, redirectTo, createGuestSession]);

  const wrapWithTitle = (content: React.ReactNode) => {
    if (title) {
      return (
        <>
          <title>{title}</title>
          {content}
        </>
      );
    }
    return content;
  };

  if (type === 'user-only' && !isAuthenticated) {
    return null;
  }

  if (type === 'guest-or-user' && !isAuthenticated && !isGuest) {
    return null;
  }

  return wrapWithTitle(<>{children}</>);
}
