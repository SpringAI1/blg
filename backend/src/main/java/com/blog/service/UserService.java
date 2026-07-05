package com.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.entity.User;
import com.blog.dto.UserDTO;

public interface UserService extends IService<User> {
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    User getUserByUsernameEntity(String username);
    User register(String username, String password, String email);
    void updateProfile(Long userId, String email, String avatar, String password, String nickname, String bio);
    Page<UserDTO> getUserList(int pageNum, int pageSize, String keyword);
    void updateUserRole(Long id, String role);
}
