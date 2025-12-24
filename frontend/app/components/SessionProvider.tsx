'use client';

import { useAuth } from "@/app/hooks";
import { useEffect } from "react";
import { csrfService } from "@/app/services/api/csrfService";
import Loader from "./ui/Loader/Loader";

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
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <Loader size="xl" />
        <p className="font-black italic">Loading data...</p>
      </div>
    );
  }

  return <>{children}</>;
}
