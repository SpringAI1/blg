package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Comment;
import com.blog.entity.CommentLike;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentLikeRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;
import com.blog.service.CommentService;
import com.blog.dto.CommentDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentRepository, Comment> implements CommentService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final CommentLikeRepository commentLikeRepository;

    public CommentServiceImpl(UserRepository userRepository, ArticleRepository articleRepository,
                               CommentLikeRepository commentLikeRepository) {
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.commentLikeRepository = commentLikeRepository;
    }

    @Override
    public List<CommentDTO> getCommentsByArticle(Long articleId, Long currentUserId) {
        List<Comment> comments = baseMapper.selectList(
            new LambdaQueryWrapper<Comment>()
                .eq(Comment::getArticleId, articleId)
                .orderByAsc(Comment::getCreateTime)
        );

        // 收集所有评论ID
        Set<Long> likedCommentIds = currentUserId != null ? getLikedCommentIds(comments, currentUserId) : Set.of();

        List<CommentDTO> dtos = comments.stream()
            .map(c -> convertToDTO(c, likedCommentIds))
            .collect(Collectors.toList());

        return buildTree(dtos);
    }

    private Set<Long> getLikedCommentIds(List<Comment> comments, Long userId) {
        if (comments.isEmpty()) return Set.of();
        List<Long> ids = comments.stream().map(Comment::getId).collect(Collectors.toList());
        List<CommentLike> likes = commentLikeRepository.selectList(
            new LambdaQueryWrapper<CommentLike>()
                .in(CommentLike::getCommentId, ids)
                .eq(CommentLike::getUserId, userId)
        );
        return likes.stream().map(CommentLike::getCommentId).collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public CommentDTO createComment(Long articleId, Long userId, String content, Long parentId) {
        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);
        comment.setLikes(0);
        baseMapper.insert(comment);

        articleRepository.incrementCommentCount(articleId);

        return convertToDTO(comment, Set.of());
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = baseMapper.selectById(id);
        if (comment == null) return;

        // 删除所有关联的点赞记录
        commentLikeRepository.delete(
            new LambdaQueryWrapper<CommentLike>().eq(CommentLike::getCommentId, id)
        );

        int childCount = deleteChildComments(id);

        baseMapper.deleteById(id);

        int deletedCount = 1 + childCount;
        articleRepository.decrementCommentCount(comment.getArticleId(), deletedCount);
    }

    private int deleteChildComments(Long parentId) {
        List<Comment> children = baseMapper.selectList(
            new LambdaQueryWrapper<Comment>()
                .eq(Comment::getParentId, parentId)
        );
        int count = 0;
        for (Comment child : children) {
            count += deleteChildComments(child.getId());
            // 递归删除子评论的点赞
            commentLikeRepository.delete(
                new LambdaQueryWrapper<CommentLike>().eq(CommentLike::getCommentId, child.getId())
            );
            baseMapper.deleteById(child.getId());
            count++;
        }
        return count;
    }

    @Override
    public List<CommentDTO> getAllComments() {
        List<Comment> comments = baseMapper.selectList(
            new LambdaQueryWrapper<Comment>()
                .orderByDesc(Comment::getCreateTime)
        );

        List<CommentDTO> dtos = comments.stream()
            .map(c -> convertToDTO(c, Set.of()))
            .collect(Collectors.toList());

        return buildTree(dtos);
    }

    @Override
    @Transactional
    public void toggleLike(Long commentId, Long userId) {
        Comment comment = baseMapper.selectById(commentId);
        if (comment == null) {
            throw new RuntimeException("评论不存在");
        }

        LambdaQueryWrapper<CommentLike> wrapper = new LambdaQueryWrapper<CommentLike>()
            .eq(CommentLike::getCommentId, commentId)
            .eq(CommentLike::getUserId, userId);

        CommentLike existing = commentLikeRepository.selectOne(wrapper);
        if (existing != null) {
            // 已点赞 → 取消
            commentLikeRepository.deleteById(existing.getId());
            comment.setLikes(Math.max(0, comment.getLikes() - 1));
        } else {
            // 未点赞 → 点赞
            CommentLike like = new CommentLike();
            like.setCommentId(commentId);
            like.setUserId(userId);
            commentLikeRepository.insert(like);
            comment.setLikes(comment.getLikes() != null ? comment.getLikes() + 1 : 1);
        }
        baseMapper.updateById(comment);
    }

    private CommentDTO convertToDTO(Comment comment, Set<Long> likedCommentIds) {
        CommentDTO dto = new CommentDTO();
        BeanUtils.copyProperties(comment, dto);

        User user = userRepository.selectById(comment.getUserId());
        if (user != null) {
            dto.setUsername(user.getUsername());
            dto.setUserAvatar(user.getAvatar());
        }

        dto.setChildren(new ArrayList<>());
        return dto;
    }

    private List<CommentDTO> buildTree(List<CommentDTO> comments) {
        return comments.stream()
            .filter(c -> c.getParentId() == null)
            .peek(p -> p.setChildren(getDirectChildren(p.getId(), comments)))
            .collect(Collectors.toList());
    }

    private List<CommentDTO> getDirectChildren(Long parentId, List<CommentDTO> allComments) {
        return allComments.stream()
            .filter(c -> parentId.equals(c.getParentId()))
            .peek(c -> c.setChildren(new ArrayList<>()))
            .collect(Collectors.toList());
    }
}
