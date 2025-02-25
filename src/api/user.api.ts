import { httpApi } from "@/api/http.api";

export interface UserInfo {
  birthday?: string;
  country?: string;
  city?: string;
  username?: string;
  address?: string;
  sex?: string;
  facebook?: string;
  linkedin?: string;
  fullName?: string;
  github?: string;
  phone?: string;
  email?: string;
  website?: string;
  coverLetter?: string;
  skills?: string[];
}

export const updateUserAPI = async (data: UserInfo) => {
  httpApi
    .post<undefined>("/user/update-info", { ...data })
    .then(({ data }) => data);
};

export const updateCVAPI = async (cvURL: string) => {
  return httpApi
    .post<undefined>("/user/update-cv", { cvURL })
    .then(({ data }) => data);
};
