/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import {
  EventListQueryModel,
  getDetailEventAPI,
  getEventListAllAPI,
  saveShowsAPI,
} from '@/api/events.api';
import { ShowModel } from '@/domain/ShowModel';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getEventList = createAsyncThunk(
  '',
  async (query: EventListQueryModel, { dispatch }) => {
    return getEventListAllAPI(query).then((res) => {
      return res;
    });
  },
);

export const getEventDetail = createAsyncThunk(
  '',
  async (id: string, { dispatch }) => {
    return getDetailEventAPI(id).then((res) => {
      return res;
    });
  },
);
