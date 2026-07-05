package com.blog.util;

import java.util.ArrayList;
import java.util.List;

/**
 * SQL 语句解析工具 — 按分号分割 SQL 文本，正确处理注释和字符串字面量
 */
public class SqlParserUtil {

    /**
     * 将 SQL 文本按分号分割为独立的 SQL 语句
     */
    public static List<String> parseSqlStatements(String sql) {
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
