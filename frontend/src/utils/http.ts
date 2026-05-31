import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 由于 axios 拦截器会返回 response.data 而非完整的 AxiosResponse，
// 我们通过这个辅助函数正确处理类型
export async function apiGet<T>(url: string, params?: any): Promise<T> {
  const res = await axiosInstance.get<any>(url, { params });
  return (res as any as ApiResponse<T>).data;
}

export async function apiPost<T>(url: string, data?: any): Promise<T> {
  const res = await axiosInstance.post<any>(url, data);
  return (res as any as ApiResponse<T>).data;
}

export async function apiPut<T>(url: string, data?: any): Promise<T> {
  const res = await axiosInstance.put<any>(url, data);
  return (res as any as ApiResponse<T>).data;
}

export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await axiosInstance.delete<any>(url);
  return (res as any as ApiResponse<T>).data;
}

// 拦截错误
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    const responseData = error.response?.data;
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const errorMessage = responseData?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);
