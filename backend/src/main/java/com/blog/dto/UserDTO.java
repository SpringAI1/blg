package com.blog.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String nickname;
    private String bio;
    private String email;
    private String avatar;
    private String role;
    private Integer followerCount;
    private Integer followingCount;
    private Integer articleCount;
    private LocalDateTime createTime;
}
