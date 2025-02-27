import { httpApi } from '@/api/http.api';

export interface SignUrlRequest {
  fileName: string;
  contentType: string;
  isPublic: boolean;
  folder: string;
}

export interface SignUrlResponse {
  key: string;
  url: string;
}

export const getSignUrl = async (
  signUrlRequest: SignUrlRequest,
): Promise<SignUrlResponse> => {
  try {
    const response = await httpApi.get<any>(
      '/media/signedUrlForPuttingObject',
      {
        params: signUrlRequest,
      },
    );
    return response.data.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
