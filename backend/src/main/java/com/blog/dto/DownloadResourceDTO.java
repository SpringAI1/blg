package com.blog.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DownloadResourceDTO {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private String fileUrl;
    private String fileSize;
    private String fileType;
    private Integer downloadCount;
    private Integer views;
    private BigDecimal rating;
    private Integer ratingCount;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Long userId;
    private String username;
    private Boolean isFree;
    private BigDecimal price;
    private List<String> tagList;
    private String status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
