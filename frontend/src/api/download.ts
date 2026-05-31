import { apiGet, apiPost } from '@/utils/http';
import { PageResult } from '@/types';

export interface DownloadCategory {
  id: number;
  name: string;
  icon: string;
  sortOrder: number;
  createTime: string;
}

export interface DownloadResource {
  id: number;
  title: string;
  description: string;
  icon: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  downloadCount: number;
  views: number;
  rating: number;
  ratingCount: number;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  userId: number;
  username: string;
  isFree: boolean;
  price: number;
  tagList: string[];
  status: string;
  createTime: string;
  updateTime: string;
}

export const downloadApi = {
  getResources: (pageNum: number, pageSize: number, categoryId?: number, keyword?: string) =>
    apiGet<PageResult<DownloadResource>>('/downloads', { pageNum, pageSize, categoryId, keyword }),

  getCategories: () =>
    apiGet<DownloadCategory[]>('/downloads/categories'),

  getResource: (id: number) =>
    apiGet<DownloadResource>(`/downloads/${id}`),

  recordDownload: (id: number) =>
    apiPost<void>(`/downloads/${id}/download`),

  redirectToDownload: (id: number) => {
    window.open(`http://localhost:8080/api/downloads/${id}/redirect`, '_blank');
  },
};
