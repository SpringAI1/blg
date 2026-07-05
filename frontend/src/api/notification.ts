import { apiGet, apiPut } from '@/utils/http';
import { PageResult } from '@/types';

export interface Notification {
  id: number;
  userId: number;
  type: 'COMMENT' | 'REPLY' | 'LIKE' | 'FOLLOW';
  content: string;
  relatedUserId?: number;
  relatedArticleId?: number;
  relatedCommentId?: number;
  isRead: boolean;
  createTime: string;
}

export const notificationApi = {
  getNotifications: (pageNum: number = 1, pageSize: number = 20) =>
    apiGet<PageResult<Notification>>('/notifications', { pageNum, pageSize }),

  getUnreadCount: () =>
    apiGet<number>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    apiPut<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiPut<void>('/notifications/read-all'),
};
