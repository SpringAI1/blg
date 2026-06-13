/**
 * 统一 HTTP 请求层 —— 不直接依赖 axios，方便后续接入 UniAppX
 *
 * 当前使用 axios 作为 adapter，后续切换只需替换此文件。
 * 所有 API 模块通过 ./http.ts 导出函数进行请求，不直接引用 axios。
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ========== 请求适配器接口（后续可替换实现） ==========
export interface RequestAdapter {
  get<T>(url: string, params?: any): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

export const API_BASE_URL = '/api';

// ========== 响应格式 ==========
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// ========== Axios 实例（当前适配器） ==========
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

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiResponse>) => {
    const responseData = error.response?.data;
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const errorMessage = responseData?.message || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

// ========== 导出请求函数（各 API 模块使用这些函数，不直接操作 axios） ==========

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
