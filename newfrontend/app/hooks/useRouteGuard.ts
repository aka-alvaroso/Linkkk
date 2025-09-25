"use client"
import { useAuth } from '../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type RouteType = 'public' | 'guest-or-user' | 'user-only';

interface UseRouteGuardOptions {
  type: RouteType;
  redirectTo?: string;
  onUnauthorized?: () => void;
}

export const useRouteGuard = ({ 
  type, 
  redirectTo = '/auth/login',
  onUnauthorized 
}: UseRouteGuardOptions) => {
  const { user, isAuthenticated, isGuest } = useAuth();
  const router = useRouter();

  const hasAccess = () => {
    switch (type) {
      case 'public':
        return true;
      
      case 'guest-or-user':
        return isAuthenticated || isGuest;
      
      case 'user-only':
        return isAuthenticated && user;
      
      default:
        return false;
    }
  };

  useEffect(() => {
    const checkAccess = () => {
      switch (type) {
        case 'public':
          return true;
        case 'guest-or-user':
          return isAuthenticated || isGuest;
        case 'user-only':
          return isAuthenticated && user;
        default:
          return false;
      }
    };

    if (!checkAccess()) {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isGuest, user, type, router, redirectTo, onUnauthorized]);

  return {
    hasAccess: hasAccess(),
    user,
    isAuthenticated,
    isGuest,
  };
};
