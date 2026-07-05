package com.blog.config;

import com.blog.util.SqlParserUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.List;

@Component
@Order(1)
public class DatabaseInit implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInit.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private Environment env;

    @Override
    public void run(String... args) throws Exception {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM article", Integer.class);
            if (count != null && count > 0) {
                log.info("数据库已包含数据，跳过初始化");
                return;
            }
        } catch (Exception e) {
            log.info("开始初始化数据库...");
        }

        String url = env.getProperty("spring.datasource.url", "");
        boolean isH2 = url.contains("h2");
        String schemaFile = isH2 ? "schema-h2.sql" : "schema.sql";

        try {
            ClassPathResource schemaResource = new ClassPathResource(schemaFile);
            if (schemaResource.exists()) {
                String sql = FileCopyUtils.copyToString(new InputStreamReader(schemaResource.getInputStream(), StandardCharsets.UTF_8));
                List<String> statements = SqlParserUtil.parseSqlStatements(sql);

                int successCount = 0;
                int errorCount = 0;

                for (String statement : statements) {
                    try {
                        jdbcTemplate.execute(statement);
                        successCount++;
                    } catch (Exception e) {
                        errorCount++;
                        log.warn("执行SQL出错 (继续下一个): {}", e.getMessage());
                    }
                }

                log.info("数据库初始化完成！成功: {}, 错误: {}", successCount, errorCount);
            }
        } catch (Exception e) {
            log.error("数据库初始化失败", e);
        }
    }
}
