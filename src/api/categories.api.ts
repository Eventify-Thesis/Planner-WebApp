import { httpApi } from '@/api/http.api';

export interface Category {
  id?: string;
  code: string;
  nameEn: string;
  nameVi: string;
  image?: string;
}
export const getListCategoriesAPI = async (): Promise<Category[]> => {
  try {
    const response = await httpApi.get(`/categories`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
