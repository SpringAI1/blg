package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.User;
import com.blog.service.UserService;
import com.blog.dto.UserDTO;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public Result<UserDTO> getUser(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        if (user == null) {
            return Result.error(404, "用户不存在");
        }
        return Result.success(user);
    }

    @GetMapping("/me")
    public Result<UserDTO> getCurrentUser() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        return Result.success(userService.getUserById(userId));
    }

    @PutMapping("/profile")
    public Result<UserDTO> updateProfile(@RequestBody User user) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        userService.updateProfile(userId, user.getEmail(), user.getAvatar(), user.getPassword(), user.getNickname(), user.getBio());
        return Result.success(userService.getUserById(userId));
    }
}
