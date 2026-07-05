package com.blog.controller;

import com.blog.util.SqlParserUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/init")
@PreAuthorize("hasRole('ADMIN')")
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
                "article", "tag", "category", "blog_user"
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
            ClassPathResource resource = new ClassPathResource("schema-h2.sql");
            if (resource.exists()) {
                String sql = FileCopyUtils.copyToString(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
                List<String> statements = SqlParserUtil.parseSqlStatements(sql);
                
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
}
