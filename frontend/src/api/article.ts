import { apiGet, apiPost, apiPut, apiDelete } from '@/utils/http';
import { Article, PageResult } from '@/types';

export const articleApi = {
  getPublishedArticles: (pageNum: number, pageSize: number, categoryId?: number, tagId?: number, keyword?: string, sortBy?: string) =>
    apiGet<PageResult<Article>>('/articles', { pageNum, pageSize, categoryId, tagId, keyword, sortBy }),

  getPublishedArticle: (id: number) =>
    apiGet<Article>(`/articles/published/${id}`),

  getArticlesByUser: (pageNum: number, pageSize: number) =>
    apiGet<PageResult<Article>>('/articles/user/articles', { pageNum, pageSize }),

  getAllArticles: (pageNum: number, pageSize: number) =>
    apiGet<PageResult<Article>>('/articles/all', { pageNum, pageSize }),

  getArticlesByUserId: (userId: number, pageNum: number, pageSize: number) =>
    apiGet<PageResult<Article>>(`/articles/user/${userId}`, { pageNum, pageSize }),

  getArticle: (id: number) =>
    apiGet<Article>(`/articles/${id}`),

  createArticle: (data: any) =>
    apiPost<Article>('/articles', data),

  updateArticle: (id: number, data: any) =>
    apiPut<Article>(`/articles/${id}`, data),

  deleteArticle: (id: number) =>
    apiDelete(`/articles/${id}`),

  likeArticle: (id: number) =>
    apiPost(`/articles/${id}/like`),

  checkLike: (id: number) =>
    apiGet<boolean>(`/articles/${id}/check-like`),

  getRelatedArticles: (id: number) =>
    apiGet<Article[]>(`/articles/${id}/related`),
};
