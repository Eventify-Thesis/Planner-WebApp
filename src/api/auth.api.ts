import { httpApi } from '@/api/http.api';
import { ChangePasswordMessage } from '@/components/profile/profileCard/profileFormNav/nav/SecuritySettings/passwordForm/PasswordForm/PasswordForm';
import { UserModel } from '@/domain/UserModel';

export interface AuthData {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface SecurityCodePayload {
  code: string;
}

export interface NewPasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserModel;
}

export const login = (loginPayload: LoginRequest): Promise<LoginResponse> =>
  httpApi
    .post<LoginResponse>('/auth/signin', { ...loginPayload })
    .then(({ data }) => data);

export const signUp = (signUpData: SignUpRequest): Promise<undefined> =>
  httpApi
    .post<undefined>('/auth/signup', { ...signUpData })
    .then(({ data }) => data);

export const resetPassword = (
  resetPasswordPayload: ResetPasswordRequest,
): Promise<undefined> =>
  httpApi
    .post<undefined>('/auth/forgotPassword', { ...resetPasswordPayload })
    .then(({ data }) => data);

export const verifySecurityCode = (
  securityCodePayload: SecurityCodePayload,
): Promise<undefined> =>
  httpApi
    .post<undefined>('verifySecurityCode', { ...securityCodePayload })
    .then(({ data }) => data);

export const setNewPassword = (
  newPasswordData: NewPasswordData,
): Promise<ChangePasswordMessage> =>
  httpApi
    .post<ChangePasswordMessage>(
      '/auth/change-password',
      { ...newPasswordData },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    )
    .then(({ data }) => data);
