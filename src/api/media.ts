// @ts-nocheck
// @ts-ignore
import { httpApi } from "@/api/http.api";

export interface SignUrlRequest {
  fileName: string;
  contentType: string;
  isPublic: boolean;
}

export interface SignUrlResponse {
  key: string;
  url: string;
}

export const getSignUrl = async (
  signUrlRequest: SignUrlRequest
): Promise<SignUrlResponse> => {
  try {
    const response = await httpApi.get<SignUrlResponse>(
      "/media/signedUrlForPuttingObject",
      { params: signUrlRequest }
    );
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
