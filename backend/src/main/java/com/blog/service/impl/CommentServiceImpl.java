package com.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Article;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
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

@Service
public class CommentServiceImpl extends ServiceImpl<CommentRepository, Comment> implements CommentService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;

    public CommentServiceImpl(UserRepository userRepository, ArticleRepository articleRepository) {
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
    }

    @Override
    public List<CommentDTO> getCommentsByArticle(Long articleId) {
        List<Comment> comments = baseMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Comment>()
                .eq(Comment::getArticleId, articleId)
                .orderByAsc(Comment::getCreateTime)
        );

        List<CommentDTO> dtos = comments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return buildTree(dtos);
    }

    @Override
    @Transactional
    public CommentDTO createComment(Long articleId, Long userId, String content, Long parentId) {
        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);
        baseMapper.insert(comment);

        Article article = articleRepository.selectById(articleId);
        if (article != null) {
            article.setCommentCount((article.getCommentCount() == null ? 0 : article.getCommentCount()) + 1);
            articleRepository.updateById(article);
        }

        return convertToDTO(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = baseMapper.selectById(id);
        if (comment == null) return;

        // 先递归删除所有子评论
        deleteChildComments(id);

        baseMapper.deleteById(id);

        // 更新文章评论计数：计算本次实际删除的数量（含子评论）
        int deletedCount = 1 + countChildComments(id);
        Article article = articleRepository.selectById(comment.getArticleId());
        if (article != null) {
            article.setCommentCount(Math.max(0, (article.getCommentCount() == null ? 0 : article.getCommentCount()) - deletedCount));
            articleRepository.updateById(article);
        }
    }

    /** 递归删除所有子评论 */
    private void deleteChildComments(Long parentId) {
        List<Comment> children = baseMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Comment>()
                .eq(Comment::getParentId, parentId)
        );
        for (Comment child : children) {
            deleteChildComments(child.getId()); // 递归删除孙评论
            baseMapper.deleteById(child.getId());
        }
    }

    /** 统计子评论数量（含递归） */
    private int countChildComments(Long parentId) {
        List<Comment> children = baseMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Comment>()
                .eq(Comment::getParentId, parentId)
        );
        int count = children.size();
        for (Comment child : children) {
            count += countChildComments(child.getId());
        }
        return count;
    }

    @Override
    public List<CommentDTO> getAllComments() {
        List<Comment> comments = baseMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Comment>()
                .orderByDesc(Comment::getCreateTime)
        );

        List<CommentDTO> dtos = comments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());

        return buildTree(dtos);
    }

    private CommentDTO convertToDTO(Comment comment) {
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

    /** 获取一级子评论（不含更深嵌套，仿抖音平铺样式） */
    private List<CommentDTO> getDirectChildren(Long parentId, List<CommentDTO> allComments) {
        return allComments.stream()
            .filter(c -> parentId.equals(c.getParentId()))
            .peek(c -> c.setChildren(new ArrayList<>())) // 不再递归，子评论没有更深的子评论
            .collect(Collectors.toList());
    }
}
