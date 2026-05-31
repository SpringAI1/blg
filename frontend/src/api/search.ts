import { apiGet } from '@/utils/http';

export interface SearchResult {
  articles: any[];
  resources: any[];
  articleTotal: number;
  resourceTotal: number;
}

export const searchApi = {
  searchAll: (keyword: string, pageNum = 1, pageSize = 10) =>
    apiGet<SearchResult>('/search', { keyword, pageNum, pageSize }),
};
