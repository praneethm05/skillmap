import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

export default function RequireAuth({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-gray-50/20 px-4 py-10 text-sm text-gray-600 sm:px-6">
        Loading account...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
