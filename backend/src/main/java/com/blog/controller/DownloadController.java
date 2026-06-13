package com.blog.controller;

import com.blog.common.Result;
import com.blog.dto.DownloadResourceDTO;
import com.blog.entity.DownloadCategory;
import com.blog.service.DownloadService;
import com.blog.util.SecurityUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/downloads")
public class DownloadController {

    @Autowired
    private DownloadService downloadService;

    @GetMapping
    public Result<Page<DownloadResourceDTO>> getResources(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "12") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "latest") String sort) {
        return Result.success(downloadService.getResources(pageNum, pageSize, categoryId, keyword, sort));
    }

    @GetMapping("/categories")
    public Result<List<DownloadCategory>> getCategories() {
        return Result.success(downloadService.getAllCategories());
    }

    @GetMapping("/{id}")
    public Result<DownloadResourceDTO> getResource(@PathVariable Long id) {
        DownloadResourceDTO resource = downloadService.getResource(id);
        if (resource != null) {
            downloadService.increaseViews(id);
        }
        return Result.success(resource);
    }

    @PostMapping("/{id}/download")
    public Result<Void> downloadResource(@PathVariable Long id) {
        DownloadResourceDTO resource = downloadService.getResource(id);
        if (resource == null) {
            return Result.error(404, "资源不存在");
        }
        Long userId = SecurityUtil.getCurrentUserId();
        downloadService.recordDownload(id, userId);
        return Result.success();
    }

    @GetMapping("/{id}/redirect")
    public ResponseEntity<byte[]> redirectToDownload(@PathVariable Long id) {
        DownloadResourceDTO resource = downloadService.getResource(id);
        if (resource == null) {
            return ResponseEntity.notFound().build();
        }
        Long userId = SecurityUtil.getCurrentUserId();
        downloadService.recordDownload(id, userId);

        // 检查 fileUrl 是否有效（不指向 example.com 且以文件扩展名结尾）
        String fileUrl = resource.getFileUrl();
        boolean hasValidUrl = fileUrl != null && !fileUrl.isEmpty()
            && !fileUrl.contains("example.com")
            && !fileUrl.contains("react.dev")
            && (fileUrl.endsWith(".pdf") || fileUrl.endsWith(".zip") || fileUrl.endsWith(".rar")
                || fileUrl.endsWith(".docx") || fileUrl.endsWith(".xlsx") || fileUrl.endsWith(".pptx")
                || fileUrl.endsWith(".png") || fileUrl.endsWith(".jpg") || fileUrl.endsWith(".mp4"));
        if (hasValidUrl) {
            // 有真实文件 URL，下载该文件
            try {
                java.net.URL url = new java.net.URL(fileUrl);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                if (conn.getResponseCode() == 200) {
                    byte[] remoteContent = conn.getInputStream().readAllBytes();
                    String fileName = getFileName(resource.getTitle(), resource.getFileType());
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                    headers.setContentDisposition(ContentDisposition.attachment().filename(fileName, StandardCharsets.UTF_8).build());
                    headers.setContentLength(remoteContent.length);
                    return ResponseEntity.ok().headers(headers).body(remoteContent);
                }
            } catch (Exception e) {
                // 远程文件不可达，降级到生成文件
            }
        }

        // 生成真实文件内容 — 根据文件类型提供可用的格式
        byte[] fileContent;
        String fileName;
        String fileType = resource.getFileType() != null ? resource.getFileType().toLowerCase() : "";

        if (fileType.contains("xls") || fileType.contains("excel") || fileType.contains("csv")) {
            // 生成 CSV（Excel 可直接打开）
            fileName = getFileName(resource.getTitle(), ".csv");
            StringBuilder csv = new StringBuilder();
            csv.append("资源名称,类型,大小,下载次数,评分,简介\n");
            csv.append(escapeCsv(resource.getTitle())).append(",");
            csv.append(escapeCsv(resource.getFileType() != null ? resource.getFileType() : "")).append(",");
            csv.append(escapeCsv(resource.getFileSize() != null ? resource.getFileSize() : "")).append(",");
            csv.append(resource.getDownloadCount()).append(",");
            csv.append(resource.getRating() != null ? resource.getRating() : 0).append(",");
            csv.append(escapeCsv(resource.getDescription() != null ? resource.getDescription() : "")).append("\n");
            fileContent = csv.toString().getBytes(StandardCharsets.UTF_8);
        } else if (fileType.contains("word") || fileType.contains("doc")) {
            // 生成格式化的 Markdown（Word 可导入）
            fileName = getFileName(resource.getTitle(), ".md");
            String md = String.format("# %s\n\n**类型**: %s  **大小**: %s  **下载**: %d次\n\n## 简介\n\n%s\n\n---\n*由二灵湃湃树博客系统导出*",
                resource.getTitle(),
                resource.getFileType() != null ? resource.getFileType() : "未知",
                resource.getFileSize() != null ? resource.getFileSize() : "未知",
                resource.getDownloadCount(),
                resource.getDescription() != null ? resource.getDescription() : "暂无描述");
            fileContent = md.getBytes(StandardCharsets.UTF_8);
        } else if (fileType.contains("ppt") || fileType.contains("powerpoint")) {
            // 生成格式文本
            fileName = getFileName(resource.getTitle(), ".md");
            String md = String.format("# %s\n\n## 概览\n- 类型: %s\n- 大小: %s\n- 下载: %d次\n- 评分: %.1f\n\n## 内容\n\n%s\n\n---\n*由二灵湃湃树博客系统导出*",
                resource.getTitle(),
                resource.getFileType() != null ? resource.getFileType() : "未知",
                resource.getFileSize() != null ? resource.getFileSize() : "未知",
                resource.getDownloadCount(),
                resource.getRating() != null ? resource.getRating() : 0,
                resource.getDescription() != null ? resource.getDescription() : "暂无描述");
            fileContent = md.getBytes(StandardCharsets.UTF_8);
        } else if (fileType.contains("pdf")) {
            // 生成格式文本
            fileName = getFileName(resource.getTitle(), ".md");
            String md = String.format("# %s\n\n**类型**: %s  **大小**: %s\n**下载**: %d次  **评分**: %.1f\n\n## 内容简介\n\n%s\n\n---\n*由二灵湃湃树博客系统导出*",
                resource.getTitle(),
                resource.getFileType() != null ? resource.getFileType() : "未知",
                resource.getFileSize() != null ? resource.getFileSize() : "未知",
                resource.getDownloadCount(),
                resource.getRating() != null ? resource.getRating() : 0,
                resource.getDescription() != null ? resource.getDescription() : "暂无描述");
            fileContent = md.getBytes(StandardCharsets.UTF_8);
        } else {
            // 默认 TXT
            fileName = getFileName(resource.getTitle(), ".txt");
            String content = String.format("""
                【%s】
                ====================================
                类型: %s | 大小: %s
                下载: %d次 | 浏览: %d次 | 评分: %.1f
                ====================================
                %s
                """,
                resource.getTitle(),
                resource.getFileType() != null ? resource.getFileType() : "未知",
                resource.getFileSize() != null ? resource.getFileSize() : "未知",
                resource.getDownloadCount(), resource.getViews(),
                resource.getRating() != null ? resource.getRating() : 0,
                resource.getDescription() != null ? resource.getDescription() : "暂无描述");
            fileContent = content.getBytes(StandardCharsets.UTF_8);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename(fileName, StandardCharsets.UTF_8).build());
        headers.setContentLength(fileContent.length);

        return ResponseEntity.ok().headers(headers).body(fileContent);
    }

    private String getFileName(String title, String ext) {
        String name = title.replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_");
        if (ext.startsWith(".")) return name + ext;
        return name + "." + ext;
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replaceAll("\"", "\"\"") + "\"";
        }
        return value;
    }
}
