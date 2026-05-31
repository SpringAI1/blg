package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.Comment;
import com.blog.service.CommentService;
import com.blog.dto.CommentDTO;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/articles/{id}/comments")
    public Result<List<CommentDTO>> getCommentsByArticle(@PathVariable Long id) {
        return Result.success(commentService.getCommentsByArticle(id));
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

        CommentDTO saved = commentService.createComment(id, userId, comment.getContent(), comment.getParentId());
        return Result.success(saved);
    }

    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        commentService.deleteComment(id);
        return Result.success();
    }
}
