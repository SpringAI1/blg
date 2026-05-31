package com.blog.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Comment;
import com.blog.entity.User;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;
import com.blog.service.CommentService;
import com.blog.dto.CommentDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class CommentServiceImpl extends ServiceImpl<CommentRepository, Comment> implements CommentService {

    private final UserRepository userRepository;

    public CommentServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public CommentDTO createComment(Long articleId, Long userId, String content, Long parentId) {
        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(parentId);
        baseMapper.insert(comment);
        return convertToDTO(comment);
    }

    @Override
    public void deleteComment(Long id) {
        baseMapper.deleteById(id);
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
            .peek(p -> p.setChildren(getChildren(p.getId(), comments)))
            .collect(Collectors.toList());
    }

    private List<CommentDTO> getChildren(Long parentId, List<CommentDTO> allComments) {
        return allComments.stream()
            .filter(c -> parentId.equals(c.getParentId()))
            .peek(c -> c.setChildren(getChildren(c.getId(), allComments)))
            .collect(Collectors.toList());
    }
}
