"use client"
import RouteGuard from '../RouteGuard/RouteGuard';

interface ProtectedPageProps {
  children: React.ReactNode;
  type: 'public' | 'guest-or-user' | 'user-only';
  redirectTo?: string;
  title?: string;
}

export default function ProtectedPage({ 
  children, 
  type, 
  redirectTo,
  title 
}: ProtectedPageProps) {
  return (
    <RouteGuard type={type} redirectTo={redirectTo}>
      {title && (
        <title>{title}</title>
      )}
      {children}
    </RouteGuard>
  );
}
