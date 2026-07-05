package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.ReadHistory;
import com.blog.repository.ReadHistoryRepository;
import com.blog.entity.Article;
import com.blog.repository.ArticleRepository;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @Autowired
    private ReadHistoryRepository readHistoryRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public Result<Page<ReadHistory>> getHistory(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        Page<ReadHistory> page = readHistoryRepository.selectPage(
            new Page<>(pageNum, pageSize),
            new LambdaQueryWrapper<ReadHistory>()
                .eq(ReadHistory::getUserId, userId)
                .orderByDesc(ReadHistory::getReadAt)
        );

        return Result.success(page);
    }

    @PostMapping
    public Result<Void> recordHistory(@RequestBody ReadHistory history) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        // 检查文章是否存在
        if (history.getArticleId() != null) {
            Article article = articleRepository.selectById(history.getArticleId());
            if (article == null) {
                return Result.error(404, "文章不存在");
            }
        }

        history.setUserId(userId);
        readHistoryRepository.insert(history);
        return Result.success();
    }
}
