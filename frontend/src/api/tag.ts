import { apiGet, apiPost, apiDelete } from '@/utils/http';

export interface TagInfo {
  id: number;
  name: string;
  createTime: string;
}

export const tagApi = {
  getAllTags: () =>
    apiGet<TagInfo[]>('/tags'),

  createTag: (data: { name: string }) =>
    apiPost<TagInfo>('/tags', data),

  deleteTag: (id: number) =>
    apiDelete(`/tags/${id}`),
};
