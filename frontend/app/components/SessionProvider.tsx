'use client';

import { useAuth } from "@/app/hooks";
import { useEffect, useState } from "react";
import { csrfService } from "@/app/services/api/csrfService";
import Loader from "./ui/Loader/Loader";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { checkSession, isLoading, sessionChecked } = useAuth();
  const [csrfInitialized, setCsrfInitialized] = useState(false);

  useEffect(() => {
    // IMPORTANT: Initialize CSRF token FIRST, then check session
    // This prevents race conditions where requests are made before CSRF token is ready
    const initialize = async () => {
      try {
        await csrfService.getToken();
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      } finally {
        // Always mark as initialized, even if it fails
        setCsrfInitialized(true);
        checkSession();
      }
    };

    initialize();
  }, [checkSession]);

  // Wait for CSRF initialization AND session check
  if (!csrfInitialized || (isLoading && !sessionChecked)) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <Loader size="xl" />
        <p className="font-black italic">Loading data...</p>
      </div>
    );
  }

  return <>{children}</>;
}
