/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */

import { getListCategoriesAPI } from '@/api/categories.api';
import { createAsyncThunk } from '@reduxjs/toolkit';

export const getCategories = createAsyncThunk(
  '',
  async (res: string | undefined, { dispatch }) => {
    return getListCategoriesAPI().then((res) => {
      return res;
    });
  },
);
