package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.User;
import com.blog.service.UserService;
import com.blog.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        User user = userService.getUserByUsernameEntity(username);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return Result.error(401, "用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", userService.getUserById(user.getId()));

        return Result.success(data);
    }

    @PostMapping("/register")
    public Result<Void> register(@RequestBody User user) {
        // 参数校验
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return Result.error(400, "用户名不能为空");
        }
        if (user.getUsername().length() < 3 || user.getUsername().length() > 20) {
            return Result.error(400, "用户名长度需在3-20个字符之间");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return Result.error(400, "密码不能为空");
        }
        if (user.getPassword().length() < 6) {
            return Result.error(400, "密码长度不能少于6位");
        }
        if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return Result.error(400, "邮箱格式不正确");
        }
        try {
            userService.register(user.getUsername(), user.getPassword(), user.getEmail());
            return Result.success();
        } catch (Exception e) {
            return Result.error(400, "注册失败：" + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }
}
