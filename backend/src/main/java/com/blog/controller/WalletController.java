package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.User;
import com.blog.repository.UserRepository;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private UserRepository userRepository;

    /** 查询余额 */
    @GetMapping
    public Result<Integer> getBalance() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        User user = userRepository.selectById(userId);
        return Result.success(user != null ? user.getCoins() : 0);
    }

    /** 充值 */
    @PostMapping("/recharge")
    @Transactional
    public Result<Integer> recharge(@RequestBody Map<String, Object> body) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        Object amountObj = body.get("amount");
        if (amountObj == null) return Result.error(400, "请输入充值金额");

        int amount = Integer.parseInt(amountObj.toString());
        if (amount <= 0) return Result.error(400, "金额必须大于0");

        User user = userRepository.selectById(userId);
        if (user == null) return Result.error(404, "用户不存在");

        user.setCoins((user.getCoins() == null ? 0 : user.getCoins()) + amount);
        userRepository.updateById(user);

        return Result.success(user.getCoins());
    }
}
