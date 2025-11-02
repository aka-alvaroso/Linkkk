'use client';

import { RiLoader5Fill } from "react-icons/ri";
import { useAuth } from "@/app/hooks";
import { useEffect } from "react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isLoading, sessionChecked } = useAuth();

  useEffect(() => {
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
