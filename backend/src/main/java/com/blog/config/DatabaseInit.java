package com.blog.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(1)
public class DatabaseInit implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Environment env;

    @Override
    public void run(String... args) throws Exception {
        // 检查是否需要初始化
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM article", Integer.class);
            if (count != null && count > 0) {
                System.out.println("数据库已包含数据，跳过初始化");
                return;
            }
        } catch (Exception e) {
            System.out.println("开始初始化数据库...");
        }

        // 执行统一的 schema.sql（包含表结构和初始数据）
        try {
            ClassPathResource schemaResource = new ClassPathResource("schema.sql");
            if (schemaResource.exists()) {
                String sql = FileCopyUtils.copyToString(new InputStreamReader(schemaResource.getInputStream(), StandardCharsets.UTF_8));
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

                System.out.println("数据库初始化完成！成功: " + successCount + ", 错误: " + errorCount);
            }
        } catch (Exception e) {
            System.out.println("数据库初始化失败: " + e.getMessage());
            e.printStackTrace();
        }
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

            if ((c == '\'' || c == '\"') && !inString) {
                inString = true;
                stringChar = c;
            } else if (inString && c == stringChar) {
                inString = false;
            }

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

        String trimmed = current.toString().trim();
        if (!trimmed.isEmpty()) {
            statements.add(trimmed);
        }

        return statements;
    }
}
