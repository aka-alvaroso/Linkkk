"use client"
import { useAuth } from '../../stores/authStore';
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
    // Si la página es solo para usuarios y el usuario no está autenticado, redirigir.
    if (type === 'user-only' && !isAuthenticated) {
      router.push(redirectTo);
    }

    // Si se requiere una sesión (invitado o usuario) y no hay ninguna, crear una de invitado.
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

  // Lógica de renderizado basada en el tipo de ruta y el estado ya validado
  if (type === 'user-only' && !isAuthenticated) {
    // Muestra null para evitar parpadeos mientras redirige
    return null;
  }

  if (type === 'guest-or-user' && !isAuthenticated && !isGuest) {
    // Muestra null mientras se crea la sesión de invitado
    return null;
  }

  return wrapWithTitle(<>{children}</>);
}
