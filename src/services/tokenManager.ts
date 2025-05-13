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
