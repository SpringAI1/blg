package com.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TagDTO {
    private Long id;
    private String name;
    private LocalDateTime createTime;
}
