import { httpApi } from '@/api/http.api';

export interface City {
  originId?: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  shortName?: string;
  countryId: number;
  sort: number;
  status: number;
  locationId: string;
}

export interface District {
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  cityId: number;
  sort: number;
  status: number;
  location: string;
  shortName?: string;
  originId: number;
}

export interface Ward {
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
  districtId: number;
  status: number;
  sort: number;
  originId: number;
}

export const getListCitiesAPI = async (
  regionId: number = 1,
): Promise<City[]> => {
  try {
    const response = await httpApi.get(`/locations/regions/${regionId}/cities`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getListDistrictsAPI = async (
  cityId: number,
): Promise<District[]> => {
  try {
    const response = await httpApi.get(`/locations/cities/${cityId}/districts`);
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getListWardsAPI = async (districtId: number): Promise<Ward[]> => {
  try {
    const response = await httpApi.get(
      `/locations/districts/${districtId}/wards`,
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
