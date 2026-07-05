import { apiGet, apiPost, apiDelete, apiPut } from '@/utils/http';

export interface TagInfo {
  id: number;
  name: string;
  createTime: string;
  slug?: string;
  color?: string;
}

export const tagApi = {
  getAllTags: () =>
    apiGet<TagInfo[]>('/tags'),

  createTag: (data: { name: string }) =>
    apiPost<TagInfo>('/tags', data),

  updateTag: (id: number, data: { name?: string; slug?: string; color?: string }) =>
    apiPut<TagInfo>(`/tags/${id}`, data),

  deleteTag: (id: number) =>
    apiDelete(`/tags/${id}`),
};
