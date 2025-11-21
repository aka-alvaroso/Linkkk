'use client';

import { RiLoader5Fill } from "react-icons/ri";
import { useAuth } from "@/app/hooks";
import { useEffect } from "react";
import { csrfService } from "@/app/services/api/csrfService";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isLoading, sessionChecked } = useAuth();

  useEffect(() => {
    // Initialize CSRF token and check session
    csrfService.getToken().catch((error) => {
      console.error('Failed to initialize CSRF token:', error);
    });
    checkSession();
  }, [checkSession]);

  if (isLoading && !sessionChecked) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <RiLoader5Fill size={32} className="animate-spin"/>
        <p>Cargando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
