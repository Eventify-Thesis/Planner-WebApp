import { newsTags } from 'constants/newsTags';
import { httpApi } from '@/api/http.api';
import { QueryModel } from '@/domain/QueryModel';
import { readUser } from '@/services/localStorage.service';

export interface JobListResponse {
  id: string;
  title: string;
  date: Date;
  company: string;
  companyLink: string;
  companyImageUrl: string;
  location?: string;
  companyLocation?: string;
  experience?: string;
  type?: string;
  workingMode?: string;
  industry?: [string];
  platform: 'Linkedin' | 'Topcv' | 'Indeed' | 'Vietnamworks';
}

export interface JobDetailResponse {
  requirements: [string];
  id: string;
  status?: string;
  title: string;
  date: Date;
  company: string;
  companyLink: string;
  companyImageUrl: string;
  jobLink: string;
  location?: string;
  companyLocation?: string;
  experience?: string;
  type?: string;
  workingMode?: string;
  industry?: [string];
  platform: 'Linkedin' | 'Topcv' | 'Indeed' | 'Vietnamworks';
  description: string;
}

export interface HistoryJobListResponse {
  id: string;
  title: string;
  date: Date;
  status: string;
  company: string;
  companyLink: string;
  companyImageUrl: string;
  location?: string;
  companyLocation?: string;
  experience?: string;
  type?: string;
  workingMode?: string;
  industry?: [string];
  platform: 'Linkedin' | 'Topcv' | 'Indeed' | 'Vietnamworks';
  description: string;
}

export interface PaginationResponse {
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  docs: JobListResponse[];
}

export const getJobListAPI = async (
  getJobListReq: QueryModel,
): Promise<PaginationResponse | undefined> => {
  try {
    if (getJobListReq.isMatchingCV != null && getJobListReq.isMatchingCV) {
      const userId = readUser()?._id;
      const response = await httpApi.get<PaginationResponse>('/job', {
        params: { ...getJobListReq, userId },
      });
      return response.data;
    } else {
      const response = await httpApi.get<PaginationResponse>('/job', {
        params: getJobListReq,
      });
      return response.data;
    }
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getJobDetailAPI = async (
  id: string,
): Promise<JobDetailResponse | undefined> => {
  try {
    const response = await httpApi.get<JobDetailResponse>(`/job/${id}`);
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const generateCoverLetterAPI = async (
  id: string,
): Promise<any | undefined> => {
  try {
    const response = await httpApi.get(`/job/${id}/cover-letter`);
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getHistoryJobListAPI = async (): Promise<
  HistoryJobListResponse[] | undefined
> => {
  try {
    const response = await httpApi.get<HistoryJobListResponse[]>(
      `/userJob/history/`,
    );
    return response.data;
  } catch (e: any) {
    throw new Error(e);
  }
};
