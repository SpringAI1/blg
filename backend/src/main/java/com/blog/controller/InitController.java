package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/init")
public class InitController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/clear")
    public Map<String, Object> clearDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            String[] tables = {
                "download_record", "download_resource", "download_category",
                "follow", "favorite", "comment", "article_tag",
                "article", "tag", "category", "user"
            };
            
            for (String table : tables) {
                try {
                    jdbcTemplate.execute("DROP TABLE IF EXISTS " + table);
                    System.out.println("已删除表: " + table);
                } catch (Exception e) {
                    System.out.println("删除表 " + table + " 出错: " + e.getMessage());
                }
            }
            
            result.put("success", true);
            result.put("message", "数据库表已清空！");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "清空数据库失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    @PostMapping("/database")
    public Map<String, Object> initDatabase() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 读取并执行SQL脚本
            ClassPathResource resource = new ClassPathResource("db-schema.sql");
            if (resource.exists()) {
                String sql = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
                List<String> statements = parseSqlStatements(sql);
                
                int successCount = 0;
                int errorCount = 0;
                
                for (String statement : statements) {
                    try {
                        jdbcTemplate.execute(statement);
                        successCount++;
                    } catch (Exception e) {
                        errorCount++;
                        System.out.println("执行SQL出错 (继续下一个): " + e.getMessage());
                    }
                }
                
                result.put("success", true);
                result.put("message", "数据库初始化完成！");
                result.put("successCount", successCount);
                result.put("errorCount", errorCount);
            } else {
                result.put("success", false);
                result.put("message", "找不到数据库脚本文件！");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "数据库初始化失败: " + e.getMessage());
            e.printStackTrace();
        }
        return result;
    }

    private List<String> parseSqlStatements(String sql) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inString = false;
        char stringChar = '\0';
        boolean inCommentLine = false;
        boolean inCommentBlock = false;

        for (int i = 0; i < sql.length(); i++) {
            char c = sql.charAt(i);
            
            // 处理注释
            if (inCommentLine) {
                if (c == '\n' || c == '\r') {
                    inCommentLine = false;
                }
                continue;
            }
            if (inCommentBlock) {
                if (c == '*' && i + 1 < sql.length() && sql.charAt(i + 1) == '/') {
                    inCommentBlock = false;
                    i++;
                }
                continue;
            }
            
            // 检查注释开始
            if (!inString && c == '-' && i + 1 < sql.length() && sql.charAt(i + 1) == '-') {
                inCommentLine = true;
                i++;
                continue;
            }
            if (!inString && c == '/' && i + 1 < sql.length() && sql.charAt(i + 1) == '*') {
                inCommentBlock = true;
                i++;
                continue;
            }
            
            // 处理字符串
            if ((c == '\'' || c == '\"') && !inString) {
                inString = true;
                stringChar = c;
            } else if (inString && c == stringChar) {
                inString = false;
            }
            
            // 处理语句结束
            if (!inString && c == ';') {
                String trimmed = current.toString().trim();
                if (!trimmed.isEmpty()) {
                    statements.add(trimmed);
                }
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        
        // 添加最后一条语句
        String trimmed = current.toString().trim();
        if (!trimmed.isEmpty()) {
            statements.add(trimmed);
        }
        
        return statements;
    }
}
