package com.blog.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class XssUtilTest {

    @Test
    void sanitize_ShouldEscapeScriptTag() {
        String input = "<script>alert('xss')</script>";
        String result = XssUtil.sanitize(input);

        assertFalse(result.contains("<script>"));
        assertTrue(result.contains("&lt;script&gt;"));
        assertTrue(result.contains("&lt;/script&gt;"));
    }

    @Test
    void sanitize_ShouldEscapeHtmlTags() {
        assertEquals("&lt;div&gt;hello&lt;/div&gt;",
                XssUtil.sanitize("<div>hello</div>"));
    }

    @Test
    void sanitize_ShouldEscapeAmpersand() {
        assertEquals("a &amp; b", XssUtil.sanitize("a & b"));
    }

    @Test
    void sanitize_ShouldEscapeQuotes() {
        String result = XssUtil.sanitize("<img src=\"x\" onerror=\"alert(1)\">");
        assertTrue(result.contains("&quot;"));
    }

    @Test
    void sanitizeContent_ShouldEscapeHtmlInMarkdown() {
        String content = "# Title\n\n<p>paragraph</p><script>evil()</script>";
        String result = XssUtil.sanitizeContent(content);

        assertFalse(result.contains("<script>"));
        assertFalse(result.contains("<p>"));
        assertTrue(result.contains("&lt;script&gt;"));
        assertTrue(result.contains("&lt;p&gt;"));
    }

    @Test
    void sanitizeContent_ShouldPreserveMarkdownSyntax() {
        String content = "# Heading\n\n**bold** and *italic*\n\n- list item";
        String result = XssUtil.sanitizeContent(content);

        assertTrue(result.contains("# Heading"));
        assertTrue(result.contains("**bold**"));
        assertTrue(result.contains("*italic*"));
        assertTrue(result.contains("- list item"));
    }

    @Test
    void sanitizeTitle_ShouldRemoveHtmlTags() {
        String title = "<h1>My <b>Blog</b> Post</h1>";
        String result = XssUtil.sanitizeTitle(title);

        assertFalse(result.contains("<h1>"));
        assertFalse(result.contains("<b>"));
        assertFalse(result.contains("</h1>"));
        assertFalse(result.contains("</b>"));
        assertTrue(result.contains("My"));
        assertTrue(result.contains("Blog"));
        assertTrue(result.contains("Post"));
    }

    @Test
    void sanitizeTitle_ShouldEscapeRemainingSpecialChars() {
        String title = "Price: $100 & <special>";
        String result = XssUtil.sanitizeTitle(title);

        // Tags are stripped, ampersand is escaped
        assertFalse(result.contains("<special>"));
        assertTrue(result.contains("&amp;"));
    }

    @Test
    void sanitize_WithNullInput_ShouldReturnNull() {
        assertNull(XssUtil.sanitize(null));
    }

    @Test
    void sanitize_WithEmptyInput_ShouldReturnEmpty() {
        assertEquals("", XssUtil.sanitize(""));
    }

    @Test
    void sanitizeContent_WithNullInput_ShouldReturnNull() {
        assertNull(XssUtil.sanitizeContent(null));
    }

    @Test
    void sanitizeContent_WithEmptyInput_ShouldReturnEmpty() {
        assertEquals("", XssUtil.sanitizeContent(""));
    }

    @Test
    void sanitizeTitle_WithNullInput_ShouldReturnNull() {
        assertNull(XssUtil.sanitizeTitle(null));
    }

    @Test
    void sanitizeTitle_WithEmptyInput_ShouldReturnEmpty() {
        assertEquals("", XssUtil.sanitizeTitle(""));
    }

    @Test
    void sanitize_ShouldEscapeMultipleAngleBrackets() {
        String input = "3 < 4 && 5 > 2";
        String result = XssUtil.sanitize(input);

        assertTrue(result.contains("&lt;"));
        assertTrue(result.contains("&gt;"));
    }

    @Test
    void sanitize_PlainText_ShouldBeUnchanged() {
        String plainText = "Hello, this is safe text with no HTML.";
        String result = XssUtil.sanitize(plainText);

        assertEquals(plainText, result);
    }
}
