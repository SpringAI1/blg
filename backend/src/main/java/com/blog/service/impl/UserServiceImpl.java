package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.User;
import com.blog.repository.UserRepository;
import com.blog.service.UserService;
import com.blog.dto.UserDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserRepository, User> implements UserService {

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = baseMapper.selectById(id);
        if (user == null) {
            return null;
        }
        return convertToDTO(user);
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        User user = baseMapper.selectOne(wrapper);
        if (user == null) {
            return null;
        }
        return convertToDTO(user);
    }

    @Override
    public User getUserByUsernameEntity(String username) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        return baseMapper.selectOne(wrapper);
    }

    @Override
    public User register(String username, String password, String email) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        if (baseMapper.selectOne(wrapper) != null) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole("USER");
        user.setNickname(username);
        user.setCoins(0);
        user.setFollowerCount(0);
        user.setFollowingCount(0);
        user.setArticleCount(0);
        baseMapper.insert(user);
        return user;
    }

    @Override
    public void updateProfile(Long userId, String email, String avatar, String password, String nickname, String bio) {
        User user = baseMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (email != null) {
            user.setEmail(email);
        }
        if (avatar != null) {
            user.setAvatar(avatar);
        }
        if (nickname != null) {
            user.setNickname(nickname);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        baseMapper.updateById(user);
    }

    @Override
    public Page<UserDTO> getUserList(int pageNum, int pageSize, String keyword) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(User::getCreateTime);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(User::getUsername, keyword)
                .or()
                .like(User::getNickname, keyword)
                .or()
                .like(User::getEmail, keyword));
        }
        Page<User> userPage = baseMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Page<UserDTO> dtoPage = new Page<>(userPage.getCurrent(), userPage.getSize(), userPage.getTotal());
        dtoPage.setRecords(userPage.getRecords().stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList()));
        return dtoPage;
    }

    @Override
    public void updateUserRole(Long id, String role) {
        User user = baseMapper.selectById(id);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setRole(role);
        baseMapper.updateById(user);
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
}
