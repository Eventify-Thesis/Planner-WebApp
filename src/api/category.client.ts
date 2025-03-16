import { httpApi } from './http.api';
import { Category } from './categories.api';

export const categoryClient = {
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await httpApi.get('/categories');
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },
};
