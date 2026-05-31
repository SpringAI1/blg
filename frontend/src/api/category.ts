import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/http';
import { Category } from '@/types';

export const categoryApi = {
  getAllCategories: () =>
    apiGet<Category[]>('/categories'),

  createCategory: (data: { name: string; slug?: string; description?: string }) =>
    apiPost<Category>('/categories', data),

  updateCategory: (id: number, data: { name: string; slug?: string; description?: string }) =>
    apiPut<Category>(`/categories/${id}`, data),

  deleteCategory: (id: number) =>
    apiDelete(`/categories/${id}`),
};
