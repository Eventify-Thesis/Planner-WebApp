/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import { EventListQueryModel, getEventListAllAPI } from '@/api/events.api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const getEventList = createAsyncThunk(
  '',
  async (query: EventListQueryModel, { dispatch }) => {
    return getEventListAllAPI(query).then((res) => {
      return res;
    });
  },
);
