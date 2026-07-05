package com.blog.controller;

import com.blog.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);
    private static final String UPLOAD_DIR = "uploads";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        "application/pdf",
        "application/zip", "application/x-zip-compressed",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/markdown"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg",
        ".pdf", ".zip", ".docx", ".xlsx", ".pptx", ".txt", ".md"
    );

    @PostMapping("/upload")
    public Result<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 校验文件大小
            if (file.isEmpty()) {
                return Result.error(400, "文件不能为空");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                return Result.error(400, "文件大小不能超过10MB");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                return Result.error(400, "文件名不能为空");
            }

            // 校验文件扩展名
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf(".");
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex).toLowerCase();
            }
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                return Result.error(400, "不支持的文件类型: " + extension);
            }

            // 校验 MIME 类型
            String detectedType = Files.probeContentType(Paths.get(originalFilename));
            if (detectedType != null && !ALLOWED_TYPES.contains(detectedType)) {
                log.warn("拒绝上传文件: {} (MIME: {})", originalFilename, detectedType);
                return Result.error(400, "不支持的文件格式");
            }

            String filename = UUID.randomUUID().toString() + extension;

            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            Map<String, String> result = new HashMap<>();
            result.put("url", "/uploads/" + filename);
            result.put("filename", filename);

            log.info("文件上传成功: {} -> {}", originalFilename, filename);
            return Result.success(result);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }
}
