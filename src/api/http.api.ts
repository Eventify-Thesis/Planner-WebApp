import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@/api/ApiError';
import { getToken } from '@/services/tokenManager';
import { isTokenExpired } from '@/services/tokenManager';

export const httpApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/event`,
  withCredentials: true,
});

httpApi.interceptors.request.use((config) => {
  const token = getToken();
  // Check if token is expired
  if (token && !isTokenExpired(token)) {
    // Set Authorization header properly for Axios v1+
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
  // Type guard for error.response?.data
  const errorData = error.response?.data as { message?: string } | undefined;

  throw new ApiError<ApiErrorData>(
    errorData?.message || error.message,
    error.response?.data as ApiErrorData | undefined,
  );
});

export interface ApiErrorData {
  message: string;
}
