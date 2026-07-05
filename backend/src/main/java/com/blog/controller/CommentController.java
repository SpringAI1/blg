package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.Comment;
import com.blog.service.CommentService;
import com.blog.service.NotificationService;
import com.blog.dto.CommentDTO;
import com.blog.util.SecurityUtil;
import com.blog.util.XssUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/articles/{id}/comments")
    public Result<List<CommentDTO>> getCommentsByArticle(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        return Result.success(commentService.getCommentsByArticle(id, userId));
    }

    @GetMapping("/comments/all")
    public Result<List<CommentDTO>> getAllComments() {
        return Result.success(commentService.getAllComments());
    }

    @PostMapping("/articles/{id}/comments")
    public Result<CommentDTO> addComment(@PathVariable Long id,
                                         @RequestBody Comment comment) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            return Result.error(400, "评论内容不能为空");
        }

        CommentDTO saved = commentService.createComment(id, userId, XssUtil.sanitize(comment.getContent()), comment.getParentId());

        // 通知文章作者（评论）或被回复者（回复）
        Comment existing = commentService.getById(comment.getParentId());
        Long notifyUserId;
        String notifyType;
        if (comment.getParentId() != null && existing != null) {
            notifyUserId = existing.getUserId();
            notifyType = "REPLY";
        } else {
            notifyUserId = commentService.getArticleAuthorId(id);
            notifyType = "COMMENT";
        }
        if (notifyUserId != null && !notifyUserId.equals(userId)) {
            notificationService.createNotification(notifyUserId, notifyType,
                XssUtil.sanitize(comment.getContent()).substring(0, Math.min(100, comment.getContent().length())),
                userId, id, saved != null ? saved.getId() : null);
        }

        return Result.success(saved);
    }

    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        // 获取评论并检查所有权
        Comment existing = commentService.getById(id);
        if (existing == null) {
            return Result.error(404, "评论不存在");
        }

        // 只有评论作者或 ADMIN 可以删除
        if (!existing.getUserId().equals(userId)) {
            String role = SecurityUtil.getCurrentUser() != null ? SecurityUtil.getCurrentUser().getRole() : "";
            if (!"ADMIN".equals(role)) {
                return Result.error(403, "只能删除自己的评论");
            }
        }

        commentService.deleteComment(id);
        return Result.success();
    }

    @PostMapping("/comments/{id}/like")
    public Result<Void> toggleLike(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        commentService.toggleLike(id, userId);
        return Result.success();
    }
}
