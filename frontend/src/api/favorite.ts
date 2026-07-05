import { apiGet, apiPost, apiDelete, apiPut } from '@/utils/http';
import { Article, PageResult } from '@/types';

export const favoriteApi = {
  getMyFavorites: (pageNum: number = 1, pageSize: number = 10, collectionName?: string) => {
    const params: any = { pageNum, pageSize };
    if (collectionName) params.collectionName = collectionName;
    return apiGet<PageResult<Article>>('/favorites', params);
  },

  addFavorite: (articleId: number, collectionName?: string) =>
    apiPost<string>('/favorites', { articleId, collectionName }),

  removeFavorite: (articleId: number) =>
    apiDelete<string>(`/favorites/${articleId}`),

  checkFavorite: (articleId: number) =>
    apiGet<boolean>(`/favorites/check/${articleId}`),

  updateCollection: (articleId: number, collectionName: string) =>
    apiPut<void>(`/favorites/${articleId}/collection`, { collectionName }),

  getCollections: () =>
    apiGet<string[]>('/favorites/collections'),
};
