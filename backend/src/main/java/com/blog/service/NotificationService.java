package com.blog.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.entity.Notification;

public interface NotificationService {
    void createNotification(Long userId, String type, String content,
                            Long relatedUserId, Long relatedArticleId, Long relatedCommentId);
    Page<Notification> getNotifications(Long userId, int pageNum, int pageSize);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
