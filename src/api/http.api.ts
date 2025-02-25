import axios from 'axios';
import { AxiosError } from 'axios';
import { ApiError } from '@/api/ApiError';
import { readToken } from '@/services/localStorage.service';

export const httpApi = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true,
});

httpApi.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${readToken()}`,
  };

  return config;
});

httpApi.interceptors.response.use(undefined, (error: AxiosError) => {
  throw new ApiError<ApiErrorData>(
    error.response?.data.message || error.message,
    error.response?.data,
  );
});

export interface ApiErrorData {
  message: string;
}
