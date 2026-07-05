package com.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.blog.entity.Comment;
import com.blog.dto.CommentDTO;
import java.util.List;

public interface CommentService extends IService<Comment> {
    List<CommentDTO> getCommentsByArticle(Long articleId, Long currentUserId);
    CommentDTO createComment(Long articleId, Long userId, String content, Long parentId);
    void deleteComment(Long id);
    List<CommentDTO> getAllComments();
    void toggleLike(Long commentId, Long userId);
}
