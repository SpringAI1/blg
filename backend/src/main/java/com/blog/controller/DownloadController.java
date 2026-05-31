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
            @RequestParam(required = false) String keyword) {
        return Result.success(downloadService.getResources(pageNum, pageSize, categoryId, keyword));
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
            return Result.error("资源不存在");
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

        // 创建一个包含资源信息的测试文件内容
        String content = String.format("""
                ============================================
                %s
                ============================================

                资源信息：
                - 资源ID: %d
                - 文件大小: %s
                - 文件类型: %s
                - 下载次数: %d
                - 浏览次数: %d
                - 评分: %.2f

                资源描述：
                %s

                温馨提示：
                这是一个测试下载文件。在实际生产环境中，
                这里会替换为真实的文件内容或下载链接。

                感谢使用本博客系统的下载功能！
                ============================================
                """,
                resource.getTitle(),
                resource.getId(),
                resource.getFileSize(),
                resource.getFileType(),
                resource.getDownloadCount(),
                resource.getViews(),
                resource.getRating(),
                resource.getDescription()
        );

        byte[] fileContent = content.getBytes(StandardCharsets.UTF_8);
        String fileName = resource.getTitle().replaceAll("[^a-zA-Z0-9\\u4e00-\\u9fa5]", "_") + ".txt";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(fileContent.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(fileContent);
    }
}
