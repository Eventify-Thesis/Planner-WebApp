/**
 * A simple token manager that allows components with access to Clerk's useAuth
 * to set the current token for use in API requests
 */

let currentToken: string | null = null;

export const setToken = (token: string | null): void => {
  currentToken = token;
};

export const getToken = (): string | null => {
  return currentToken;
};

export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Split the token and decode the payload
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode the payload (base64url)
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    );

    // Check if the token has an expiration time
    if (!payload.exp) return false; // If no exp claim, consider it valid

    // Add 5-minute buffer before considering token expired
    const bufferTime = 5 * 60; // 5 minutes in seconds
    const expirationTime = (payload.exp - bufferTime) * 1000;
    const currentTime = Date.now();

    return currentTime > expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If we can't decode the token, consider it expired
    return true;
  }
};
