package com.blog.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ArticleDTO {
    private Long id;
    private String title;
    private String content;
    private String summary;
    private String coverImage;
    private Integer views;
    private Integer likes;
    private Integer commentCount;
    private Integer favoriteCount;
    private String status;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private Boolean isTop;
    private List<TagDTO> tags;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
