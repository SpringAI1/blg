import { apiGet } from '@/utils/http';

export interface SearchUserResult {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  bio?: string;
  type: 'user';
}

export interface SearchTagResult {
  id: number;
  name: string;
  type: 'tag';
}

export interface SearchResult {
  articles: any[];
  resources: any[];
  users: SearchUserResult[];
  tags: SearchTagResult[];
  articleTotal: number;
  resourceTotal: number;
  userTotal: number;
}

export const searchApi = {
  searchAll: (keyword: string, pageNum = 1, pageSize = 10) =>
    apiGet<SearchResult>('/search', { keyword, pageNum, pageSize }),
};
