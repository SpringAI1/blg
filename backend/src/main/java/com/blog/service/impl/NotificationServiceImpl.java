package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Notification;
import com.blog.repository.NotificationRepository;
import com.blog.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationRepository, Notification> implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public void createNotification(Long userId, String type, String content,
                                    Long relatedUserId, Long relatedArticleId, Long relatedCommentId) {
        if (userId == null || userId.equals(relatedUserId)) return; // 不给自己发通知

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setContent(content);
        notification.setRelatedUserId(relatedUserId);
        notification.setRelatedArticleId(relatedArticleId);
        notification.setRelatedCommentId(relatedCommentId);
        notification.setIsRead(false);
        baseMapper.insert(notification);
    }

    @Override
    public Page<Notification> getNotifications(Long userId, int pageNum, int pageSize) {
        return baseMapper.selectPage(new Page<>(pageNum, pageSize),
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getCreateTime)
        );
    }

    @Override
    public long getUnreadCount(Long userId) {
        return baseMapper.selectCount(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, false)
        );
    }

    @Override
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = baseMapper.selectById(notificationId);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setIsRead(true);
            baseMapper.updateById(notification);
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        Notification notification = new Notification();
        notification.setIsRead(true);
        baseMapper.update(notification,
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, false)
        );
    }
}
