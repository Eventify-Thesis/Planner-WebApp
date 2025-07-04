import { httpApi } from './http.api';
import { City, District, Ward } from './locations.api';

export const locationClient = {
  getCities: async (regionId: number = 1): Promise<City[]> => {
    try {
      const response = await httpApi.get(
        `/locations/regions/${regionId}/cities`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getDistricts: async (cityId: number): Promise<District[]> => {
    try {
      const response = await httpApi.get(
        `/locations/cities/${cityId}/districts`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  getWards: async (districtId: number): Promise<Ward[]> => {
    try {
      const response = await httpApi.get(
        `/locations/districts/${districtId}/wards`,
      );
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },

  // New method for Vietnam 2025 restructuring - get wards directly from cities
  getWardsByCity: async (cityId: number): Promise<Ward[]> => {
    try {
      const response = await httpApi.get(`/locations/cities/${cityId}/wards`);
      return response.data.data.result;
    } catch (e: any) {
      throw new Error(e);
    }
  },
};
