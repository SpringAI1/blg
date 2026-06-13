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
  getResources: (pageNum: number, pageSize: number, categoryId?: number, keyword?: string, sort?: string) =>
    apiGet<PageResult<DownloadResource>>('/downloads', { pageNum, pageSize, categoryId, keyword, sort }),

  getCategories: () =>
    apiGet<DownloadCategory[]>('/downloads/categories'),

  getResource: (id: number) =>
    apiGet<DownloadResource>(`/downloads/${id}`),

  recordDownload: (id: number) =>
    apiPost<void>(`/downloads/${id}/download`),

  redirectToDownload: (id: number) => {
    // 使用动态创建 <a> 标签触发下载，避免弹窗拦截
    const a = document.createElement('a');
    a.href = `/api/downloads/${id}/redirect`;
    a.download = '';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
