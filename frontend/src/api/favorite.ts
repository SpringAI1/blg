import { apiGet, apiPost, apiDelete } from '@/utils/http';
import { Article, PageResult } from '@/types';

export const favoriteApi = {
  getMyFavorites: (pageNum: number = 1, pageSize: number = 10) =>
    apiGet<PageResult<Article>>('/favorites', { pageNum, pageSize }),

  addFavorite: (articleId: number) =>
    apiPost<string>('/favorites', { articleId }),

  removeFavorite: (articleId: number) =>
    apiDelete<string>(`/favorites/${articleId}`),

  checkFavorite: (articleId: number) =>
    apiGet<boolean>(`/favorites/check/${articleId}`),
};
