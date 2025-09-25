"use client"
import { useAuth } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  type: 'public' | 'guest-or-user' | 'user-only';
  redirectTo?: string;
}

export default function RouteGuard({ 
  children, 
  type, 
  redirectTo = '/auth/login' 
}: RouteGuardProps) {
  const { user, isAuthenticated, isGuest } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dar tiempo para que se verifique la sesión
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    switch (type) {
      case 'public':
        // Rutas públicas - siempre permitidas
        break;

      case 'guest-or-user':
        // Requiere al menos sesión guest o user
        if (!isAuthenticated && !isGuest) {
          router.push(redirectTo);
        }
        break;

      case 'user-only':
        // Solo usuarios autenticados
        if (!isAuthenticated || !user) {
          router.push(redirectTo);
        }
        break;
    }
  }, [isLoading, isAuthenticated, isGuest, user, type, router, redirectTo]);

  // Mostrar loading mientras se verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dark"></div>
      </div>
    );
  }

  // Verificar permisos después del loading
  switch (type) {
    case 'public':
      return <>{children}</>;

    case 'guest-or-user':
      if (!isAuthenticated && !isGuest) {
        return null; // Se está redirigiendo
      }
      return <>{children}</>;

    case 'user-only':
      if (!isAuthenticated || !user) {
        return null; // Se está redirigiendo
      }
      return <>{children}</>;

    default:
      return <>{children}</>;
  }
}
