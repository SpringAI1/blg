import { apiGet, apiPut } from '@/utils/http';
import { User } from '@/types';
import { PageResult } from '@/types';

export const userApi = {
  getUserInfo: (id: number) =>
    apiGet<User>(`/users/${id}`),

  getCurrentUser: () =>
    apiGet<User>('/users/me'),

  updateProfile: (data: { nickname?: string; bio?: string; email?: string; avatar?: string; password?: string }) =>
    apiPut<User>('/users/profile', data),

  // admin
  getUserList: (pageNum: number, pageSize: number, keyword?: string) =>
    apiGet<PageResult<User>>('/users/list', { pageNum, pageSize, keyword }),

  updateUserRole: (id: number, role: string) =>
    apiPut<void>(`/users/${id}/role`, { role }),
};
