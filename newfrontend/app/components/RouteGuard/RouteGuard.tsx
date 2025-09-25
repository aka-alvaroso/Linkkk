"use client"
import { useAuth } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (type === 'user-only' && (!isAuthenticated || !user)) {
      router.push(redirectTo);
    }

    if (type === 'guest-or-user' && !isAuthenticated && !isGuest) {
      createGuestSession();
    }
  }, [isLoading, type, isAuthenticated, isGuest, user, router, redirectTo, createGuestSession]);

  if (isLoading) {
    return (
      <>
        {/* TODO: Add loading skeleton */}
        LOADING
      </>
    );
  }

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

  switch (type) {
    case 'public':
      return wrapWithTitle(<>{children}</>);

    case 'guest-or-user':
      if (!isAuthenticated && !isGuest) {
        return null;
      }
      return wrapWithTitle(<>{children}</>);

    case 'user-only':
      if (!isAuthenticated || !user) {
        return null;
      }
      return wrapWithTitle(<>{children}</>);

    default:
      return wrapWithTitle(<>{children}</>);
  }
}
