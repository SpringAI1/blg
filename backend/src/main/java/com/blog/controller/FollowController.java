package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.Follow;
import com.blog.entity.User;
import com.blog.repository.FollowRepository;
import com.blog.repository.UserRepository;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/following")
    public Result<Page<User>> getMyFollowing(
                                     @RequestParam(defaultValue = "1") Integer pageNum,
                                     @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        LambdaQueryWrapper<Follow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Follow::getFollowerId, userId).orderByDesc(Follow::getCreateTime);
        Page<Follow> page = new Page<>(pageNum, pageSize);
        Page<Follow> resultPage = followRepository.selectPage(page, wrapper);

        if (!resultPage.getRecords().isEmpty()) {
            List<Long> followingIds = resultPage.getRecords().stream()
                    .map(Follow::getFollowingId)
                    .collect(Collectors.toList());
            
            List<User> allUsers = userRepository.selectBatchIds(followingIds);
            Map<Long, User> userMap = allUsers.stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
            
            List<User> sortedUsers = followingIds.stream()
                    .map(userMap::get)
                    .filter(u -> u != null)
                    .collect(Collectors.toList());
            
            Page<User> userPage = new Page<>(pageNum, pageSize, resultPage.getTotal());
            userPage.setRecords(sortedUsers);
            return Result.success(userPage);
        }

        Page<User> emptyPage = new Page<>(pageNum, pageSize, 0);
        emptyPage.setRecords(List.of());
        return Result.success(emptyPage);
    }

    @GetMapping("/followers")
    public Result<Page<User>> getMyFollowers(
                                     @RequestParam(defaultValue = "1") Integer pageNum,
                                     @RequestParam(defaultValue = "10") Integer pageSize) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        LambdaQueryWrapper<Follow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Follow::getFollowingId, userId).orderByDesc(Follow::getCreateTime);
        Page<Follow> page = new Page<>(pageNum, pageSize);
        Page<Follow> resultPage = followRepository.selectPage(page, wrapper);

        if (!resultPage.getRecords().isEmpty()) {
            List<Long> followerIds = resultPage.getRecords().stream()
                    .map(Follow::getFollowerId)
                    .collect(Collectors.toList());
            
            List<User> allUsers = userRepository.selectBatchIds(followerIds);
            Map<Long, User> userMap = allUsers.stream()
                    .collect(Collectors.toMap(User::getId, u -> u));
            
            List<User> sortedUsers = followerIds.stream()
                    .map(userMap::get)
                    .filter(u -> u != null)
                    .collect(Collectors.toList());
            
            Page<User> userPage = new Page<>(pageNum, pageSize, resultPage.getTotal());
            userPage.setRecords(sortedUsers);
            return Result.success(userPage);
        }

        Page<User> emptyPage = new Page<>(pageNum, pageSize, 0);
        emptyPage.setRecords(List.of());
        return Result.success(emptyPage);
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public Result<String> follow(@RequestBody Follow follow) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        if (userId.equals(follow.getFollowingId())) {
            return Result.error(400, "不能关注自己");
        }

        LambdaQueryWrapper<Follow> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(Follow::getFollowerId, userId).eq(Follow::getFollowingId, follow.getFollowingId());
        if (followRepository.selectCount(checkWrapper) > 0) {
            return Result.error(400, "已经关注过了");
        }

        follow.setFollowerId(userId);
        followRepository.insert(follow);

        // 更新被关注者的 followerCount
        User following = userRepository.selectById(follow.getFollowingId());
        if (following != null) {
            following.setFollowerCount(following.getFollowerCount() == null ? 1 : following.getFollowerCount() + 1);
            userRepository.updateById(following);
        }

        // 更新关注者的 followingCount
        User follower = userRepository.selectById(userId);
        if (follower != null) {
            follower.setFollowingCount(follower.getFollowingCount() == null ? 1 : follower.getFollowingCount() + 1);
            userRepository.updateById(follower);
        }

        return Result.success("关注成功");
    }

    @DeleteMapping("/{followingId}")
    @Transactional(rollbackFor = Exception.class)
    public Result<String> unfollow(@PathVariable Long followingId) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        // 物理删除（绕过逻辑删除），避免再次关注时 UNIQUE 约束冲突
        followRepository.deletePhysical(userId, followingId);

        // 更新被关注者的 followerCount
        User following = userRepository.selectById(followingId);
        if (following != null && following.getFollowerCount() != null && following.getFollowerCount() > 0) {
            following.setFollowerCount(following.getFollowerCount() - 1);
            userRepository.updateById(following);
        }

        // 更新关注者的 followingCount
        User follower = userRepository.selectById(userId);
        if (follower != null && follower.getFollowingCount() != null && follower.getFollowingCount() > 0) {
            follower.setFollowingCount(follower.getFollowingCount() - 1);
            userRepository.updateById(follower);
        }

        return Result.success("取消关注成功");
    }

    @GetMapping("/check/{followingId}")
    public Result<Boolean> checkFollow(@PathVariable Long followingId) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.success(false);

        LambdaQueryWrapper<Follow> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Follow::getFollowerId, userId).eq(Follow::getFollowingId, followingId);
        boolean exists = followRepository.selectCount(wrapper) > 0;

        return Result.success(exists);
    }
}
