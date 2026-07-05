package com.blog.util;

import org.springframework.web.util.HtmlUtils;

/**
 * XSS 防护工具类 — 对用户输入做 HTML 实体编码
 */
public class XssUtil {

    /**
     * 对用户输入内容进行 HTML 转义，防止 XSS 攻击
     */
    public static String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return HtmlUtils.htmlEscape(input);
    }

    /**
     * 对文章 Markdown 内容做安全处理：
     * 1. HTML 标签转义（防止注入）
     * 2. 保留 Markdown 语法
     */
    public static String sanitizeContent(String content) {
        if (content == null || content.isEmpty()) {
            return content;
        }
        // 对内容做 HTML 转义，防止 XSS
        // 前端用 react-markdown 渲染时，HTML 会被转义显示
        return HtmlUtils.htmlEscape(content);
    }

    /**
     * 对标题做安全处理
     */
    public static String sanitizeTitle(String title) {
        if (title == null || title.isEmpty()) {
            return title;
        }
        // 标题应该更严格：去除 HTML 标签
        String cleaned = title.replaceAll("<[^>]*>", "");
        return HtmlUtils.htmlEscape(cleaned);
    }
}
