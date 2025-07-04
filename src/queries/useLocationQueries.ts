import { useQuery } from '@tanstack/react-query';
import { locationClient } from '@/api/location.client';
import { City, District, Ward } from '@/api/locations.api';

export const LOCATION_QUERY_KEYS = {
  cities: 'cities',
  districts: 'districts',
  wards: 'wards',
  wardsByCity: 'wardsByCity',
};

export const useGetCities = (regionId: number = 1) => {
  return useQuery<City[]>({
    queryKey: [LOCATION_QUERY_KEYS.cities, regionId],
    queryFn: async () => {
      return await locationClient.getCities(regionId);
    },
  });
};

export const useGetDistricts = (cityId: number | null) => {
  return useQuery<District[]>({
    queryKey: [LOCATION_QUERY_KEYS.districts, cityId],
    queryFn: async () => {
      if (!cityId) return [];
      return await locationClient.getDistricts(cityId);
    },
    enabled: !!cityId,
  });
};

export const useGetWards = (districtId: number | null) => {
  return useQuery<Ward[]>({
    queryKey: [LOCATION_QUERY_KEYS.wards, districtId],
    queryFn: async () => {
      if (!districtId) return [];
      return await locationClient.getWards(districtId);
    },
    enabled: !!districtId,
  });
};

// New query hook for Vietnam 2025 restructuring - get wards directly from cities
export const useGetWardsByCity = (cityId: number | null) => {
  return useQuery<Ward[]>({
    queryKey: [LOCATION_QUERY_KEYS.wardsByCity, cityId],
    queryFn: async () => {
      if (!cityId) return [];
      return await locationClient.getWardsByCity(cityId);
    },
    enabled: !!cityId,
  });
};
