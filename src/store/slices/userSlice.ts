import {
  createAction,
  createSlice,
  PrepareAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { UserModel } from '@/domain/UserModel';
import { persistUser, readUser } from '@/services/localStorage.service';
import { updateUserAPI } from '@/api/user.api';
export interface UserState {
  user: UserModel | null;
}

const initialState: UserState = {
  user: readUser(),
};

export const setUser = createAsyncThunk(
  'auth/doSignUp',
  (newUser: UserModel) => {
    persistUser(newUser);
    console.log('newUser', newUser);

    return {
      payload: newUser,
    };
  },
);

export const updateUser = createAction<PrepareAction<UserModel>>(
  'user/updateUser',
  (newUser) => {
    persistUser(newUser);

    return updateUserAPI(newUser).then((res) => {
      return res;
    });
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setUser.fulfilled, (state, action) => {
      state.user = action.payload;
      console.log('localStorage.getItem(user)', localStorage.getItem('user'));
      console.log('action.payload', action.payload);
    });
  },
});

export default userSlice.reducer;
