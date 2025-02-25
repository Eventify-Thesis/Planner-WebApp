import { createAction, createSlice, PrepareAction } from '@reduxjs/toolkit';
import { QueryModel } from '@/domain/QueryModel';
import { persistQuery } from '@/services/localStorage.service';

export interface QueryState {
  query: QueryModel | null;
}
const initQuery: QueryModel = {
  page: 1,
  limit: 10,
  isLoaded: false,
};
const initialState: QueryState = {
  query: initQuery,
};

export const setQuery = createAction<PrepareAction<QueryModel>>(
  'user/setUser',
  (newQuery) => {
    persistQuery(newQuery);
    console.log('newQuery', newQuery);
    return {
      payload: newQuery,
    };
  },
);

export const querySlice = createSlice({
  name: 'query',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setQuery, (state, action) => {
      console.log('action.payload', action.payload);
      state.query = action.payload;
    });
  },
});

export default querySlice.reducer;
