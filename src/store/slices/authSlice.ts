import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ResetPasswordRequest,
  login,
  LoginRequest,
  signUp,
  SignUpRequest,
  resetPassword,
  verifySecurityCode,
  SecurityCodePayload,
  NewPasswordData,
  setNewPassword,
} from '@/api/auth.api';
import { setUser } from '@/store/slices/userSlice';
import {
  deleteToken,
  deleteUser,
  persistToken,
  persistUser,
  readToken,
} from '@/services/localStorage.service';
import Cookies from 'js-cookie';
import { UserModel } from '@/domain/UserModel';

export interface AuthSlice {
  token: string | null;
  user: UserModel | null;
}

const initialState: AuthSlice = {
  token: readToken(),
  user: null,
};

export const doLogin = createAsyncThunk(
  'auth/doLogin',
  async (loginPayload: LoginRequest, { dispatch }) =>
    login(loginPayload).then((res) => {
      dispatch(setUser(res.user));
      persistUser(res.user);

      // Cookies.set('refreshToken', res.refreshToken, { expires: 30 });
      // Cookies.set('accessToken', res.accessToken, { expires: 1 });

      return {
        payload: res.user,
      };
    }),
);

export const doSignUp = createAsyncThunk(
  'auth/doSignUp',
  async (signUpPayload: SignUpRequest) => signUp(signUpPayload),
);

export const doResetPassword = createAsyncThunk(
  'auth/doResetPassword',
  async (resetPassPayload: ResetPasswordRequest) =>
    resetPassword(resetPassPayload),
);

export const doVerifySecurityCode = createAsyncThunk(
  'auth/doVerifySecurityCode',
  async (securityCodePayload: SecurityCodePayload) =>
    verifySecurityCode(securityCodePayload),
);

export const doSetNewPassword = createAsyncThunk(
  'auth/doSetNewPassword',
  async (newPasswordData: NewPasswordData) => setNewPassword(newPasswordData),
);

export const doLogout = createAsyncThunk(
  'auth/doLogout',
  (payload, { dispatch }) => {
    deleteToken();
    deleteUser();
    dispatch(setUser(null));
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(doLogin.fulfilled, (state, action) => {
      state.user = action.payload;
      state.token = Cookies.get('access_token');
    });
    builder.addCase(doLogout.fulfilled, (state) => {
      state.token = null;
    });
  },
});

export default authSlice.reducer;
