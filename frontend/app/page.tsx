"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./stores/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isGuest, isLoading, sessionChecked } = useAuth();

  useEffect(() => {
    // Wait for session check to complete before redirecting
    if (!isLoading && sessionChecked) {
      if (isAuthenticated || isGuest) {
        router.push("/dashboard");
      } else {
        router.push("/landing");
      }
    }
  }, [isAuthenticated, isGuest, isLoading, sessionChecked, router]);

  // Show nothing while checking/redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-lg font-medium text-dark/50">
        Loading...
      </div>
    </div>
  );
}
