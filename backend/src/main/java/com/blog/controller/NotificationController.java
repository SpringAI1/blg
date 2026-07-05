package com.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.Notification;
import com.blog.service.NotificationService;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public Result<Page<Notification>> getNotifications(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");
        return Result.success(notificationService.getNotifications(userId, pageNum, pageSize));
    }

    @GetMapping("/unread-count")
    public Result<Long> getUnreadCount() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.success(0L);
        return Result.success(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");
        notificationService.markAsRead(id, userId);
        return Result.success();
    }

    @PutMapping("/read-all")
    public Result<Void> markAllAsRead() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");
        notificationService.markAllAsRead(userId);
        return Result.success();
    }
}
