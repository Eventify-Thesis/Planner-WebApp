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

  // Create a memoized function to update the token
  const updateToken = useCallback(async () => {
    if (isSignedIn) {
      try {
        // Get the default session token
        const token = await getToken();
        setToken(token);
      } catch (error) {
        console.error('Error getting auth token from Clerk:', error);
        setToken(null);
      }
    } else {
      setToken(null);
    }
  }, [getToken, isSignedIn]);

  // Effect for initial token setup and interval refresh
  useEffect(() => {
    // Update token immediately
    updateToken();

    // Refresh token every 5 seconds to ensure it doesn't expire
    // This is a fallback in case the focus event listeners don't trigger
    const intervalId = setInterval(updateToken, 3 * 100);

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
