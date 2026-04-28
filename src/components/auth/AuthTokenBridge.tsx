import { useAuth } from '@clerk/clerk-react';
import { useEffect, type PropsWithChildren } from 'react';
import { setAuthTokenProvider } from '../../api/httpClient';

export default function AuthTokenBridge({ children }: PropsWithChildren) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenProvider(() => getToken());

    return () => {
      setAuthTokenProvider(null);
    };
  }, [getToken]);

  return <>{children}</>;
}
