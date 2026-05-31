package com.blog.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("download_resource")
public class DownloadResource {

    @TableId(type = IdType.AUTO)
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

    private Long userId;

    private Boolean isFree;

    private BigDecimal price;

    private String tags;

    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
