import { useAuth } from '@clerk/clerk-react';

/**
 * Gets the authentication token from Clerk
 * @returns A promise that resolves to the authentication token or null if not available
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    // This function should only be called in a component context where useAuth is available
    const { getToken } = useAuth();
    return await getToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};
