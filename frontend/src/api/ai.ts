import { apiPost } from '@/utils/http';

export interface AiSearchResult {
  answer: string;
}

export const aiApi = {
  aiSearch: (query: string) =>
    apiPost<AiSearchResult>('/search/ai', { query }),
};
