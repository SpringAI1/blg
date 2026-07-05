package com.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private Long articleId;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long parentId;
    private Integer likes;
    private List<CommentDTO> children;
    private LocalDateTime createTime;
}
