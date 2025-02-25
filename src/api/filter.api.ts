import { httpApi } from '@/api/http.api';

export interface IndustryFilterResponse {
  data: string[];
}

export interface TimeFilterResponse {
  data: string[];
}

export interface TypeFiltersResponse {
  data: string[];
}

export interface LocationFilterResponse {
  data: string[];
}

export interface ExperienceLevelFiltersResponse {
  data: string[];
}

export interface WorkingModeFiltersResponse {
  data: string[];
}

export const getIndustryFilterAPI = async (): Promise<
  IndustryFilterResponse | undefined
> => {
  try {
    const response = await httpApi.get<IndustryFilterResponse>('/job/industry');
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getLocationsFilterAPI = async (): Promise<
  LocationFilterResponse | undefined
> => {
  try {
    const response = await httpApi.get<LocationFilterResponse>('/job/location');
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
