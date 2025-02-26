import { QueryModel } from '@/domain/QueryModel';
import { UserModel } from '@/domain/UserModel';
import Cookies from 'js-cookie';

export const persistToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const readToken = (): string | null => {
  return Cookies.get('__session') || null;
};

export const persistQuery = (query: QueryModel): void => {
  localStorage.setItem('query', JSON.stringify(query));
};

export const readQuery = (): QueryModel | null => {
  const queryStr = localStorage.getItem('query');
  return queryStr ? JSON.parse(queryStr) : null;
};

export const persistUser = (user: UserModel): void => {
  // localStorage.setItem('user', JSON.stringify(user));
};

export const readUser = (): UserModel | null => {
  // const userStr = localStorage.getItem('user');
  // return userStr ? JSON.parse(userStr) : testUser;
  return null;
};

export const deleteToken = (): void => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};
export const deleteUser = (): void => localStorage.removeItem('user');
