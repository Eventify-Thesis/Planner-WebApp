import { useAuth } from '@clerk/clerk-react';
import { useEffect, useCallback } from 'react';
import { setToken } from '@/services/tokenManager';

/**
 * AuthTokenProvider component that updates the token manager with the current Clerk token
 * This component should be placed high in the component tree to ensure the token is available
 * for all API requests.
 */
export const AuthTokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken, isSignedIn } = useAuth();

  const updateToken = useCallback(async () => {
    if (isSignedIn) {
      try {
        const token = await getToken({ template: 'test' });

        setToken(token);
      } catch (error) {
        // Fallback to default token if custom template fails
        try {
          const fallbackToken = await getToken();
          setToken(fallbackToken);
        } catch (fallbackError) {
          setToken(null);
        }
      }
    } else {
      setToken(null);
    }
  }, [getToken, isSignedIn]);

  // Effect for initial token setup and interval refresh
  useEffect(() => {
    // Update token immediately
    updateToken();

    // Refresh token every 30 seconds - much more reasonable frequency
    const intervalId = setInterval(updateToken, 30 * 1000);

    // Add event listener to refresh token when window gets focus
    // This helps ensure the token is fresh when the user returns to the app
    const handleFocus = () => {
      updateToken();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      setToken(null);
    };
  }, [updateToken]);

  return <>{children}</>;
};
