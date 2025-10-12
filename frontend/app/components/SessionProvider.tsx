'use client';

import { useAuth } from "../stores/authStore";
import { useEffect } from "react";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const checkSession = useAuth(state => state.checkSession);
  const isLoading = useAuth(state => state.isLoading);
  const sessionChecked = useAuth(state => state.sessionChecked);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isLoading && !sessionChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
