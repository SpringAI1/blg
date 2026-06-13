import { apiGet } from '@/utils/http';

export interface AdminStats {
  articleCount: number;
  publishedCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalFavorites: number;
}

export const statsApi = {
  getAdminStats: () => apiGet<AdminStats>('/admin/stats'),
};
