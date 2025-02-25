/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  PaginationResponse,
  getHistoryJobListAPI,
  getJobDetailAPI,
  getJobListAPI,
} from '@/api/jobs.api';
import { useAppSelector } from '@/hooks/reduxHooks';
import { setQuery } from './querySlice';
import { QueryModel } from '@/domain/QueryModel';
import { getJobStatusAPI } from '@/api/history.api';

export interface JobSlice {
  page: 1;
  limit: 10;
  search?: string;
  industry?: string;
  location?: string;
  experience?: string;
  type?: string;
  workingMode?: string;
  isMatchingCV?: boolean;
}

const initialState: JobSlice = {
  page: 1,
  limit: 10,
  search: '',
  industry: '',
  location: '',
  experience: '',
  type: '',
  workingMode: '',
  isMatchingCV: false,
};

const initModel: QueryModel = {
  page: 1,
  limit: 10,
};

export const getJobList = createAsyncThunk(
  'job/getJobList',
  async (query: QueryModel, { dispatch }) => {
    console.log('Query in slice:', query);

    return getJobListAPI(query).then((res) => {
      console.log('Response:', res);
      return res;
    });
  },
);

export const getJobDetail = createAsyncThunk(
  'job/getJobDetail',
  async (id: string) => {
    return getJobDetailAPI(id).then((res) => {
      return res;
    });
  },
);

export const getHistoryJobList = createAsyncThunk(
  'job/getUserJobList',
  async () => {
    return getHistoryJobListAPI().then((res) => {
      return res;
    });
  },
);

export const getJobStatus = createAsyncThunk(
  'job/getJobStatus',
  async (id: string) => {
    return getJobStatusAPI(id).then((res) => {
      return res;
    });
  },
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getJobList.fulfilled, (state, action) => {});
  },
});

export default jobSlice.reducer;
