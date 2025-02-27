/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import {
  getListCitiesAPI,
  getListDistrictsAPI,
  getListWardsAPI,
} from '@/api/locations.api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getCities = createAsyncThunk(
  '',
  async (regionId: number = 1, { dispatch }) => {
    return getListCitiesAPI(regionId).then((res) => {
      return res;
    });
  },
);

export const getDistricts = createAsyncThunk(
  '',
  async (cityId: number, { dispatch }) => {
    return getListDistrictsAPI(cityId).then((res) => {
      return res;
    });
  },
);

export const getWards = createAsyncThunk(
  '',
  async (districtId: number, { dispatch }) => {
    return getListWardsAPI(districtId).then((res) => {
      return res;
    });
  },
);
