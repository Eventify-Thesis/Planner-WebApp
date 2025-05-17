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
  // Decode the token
  return false;
  const decodedToken = JWT.decode(token);
  const expirationTime = decodedToken.exp * 1000;
  return Date.now() > expirationTime;
};
