import { apiPost } from '@/utils/http';

export interface LoginResponse {
  token: string;
  user: any;
}

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiPost<LoginResponse>('/auth/login', data),

  register: (data: { username: string; password: string; email: string }) =>
    apiPost<void>('/auth/register', data),

  logout: () => apiPost<void>('/auth/logout'),
};
