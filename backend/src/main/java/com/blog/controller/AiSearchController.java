package com.blog.controller;

import com.blog.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/search")
public class AiSearchController {

    private static final Logger log = LoggerFactory.getLogger(AiSearchController.class);

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String model;

    @Value("${ai.base-url:https://dashscope.aliyuncs.com/compatible-mode/v1}")
    private String baseUrl;

    @Autowired
    private RestTemplate restTemplate;

    @PostMapping("/ai")
    public Result<Map<String, Object>> aiSearch(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        if (query == null || query.trim().isEmpty()) {
            return Result.error(400, "请输入搜索关键词");
        }

        if (apiKey == null || apiKey.isEmpty()) {
            return Result.error(503, "AI 服务未配置（缺少 API Key）");
        }

        try {
            // 1. 构建通义千问 API 请求
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content",
                "你是一个技术博客的AI助手。回答用户问题，保持简洁、专业。" +
                "如果用户询问技术问题，给出清晰的解释和示例。" +
                "回答用中文。"));
            messages.add(Map.of("role", "user", "content", query));
            body.put("messages", messages);
            body.put("max_tokens", 2000);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // 2. 调用通义千问 API
            ResponseEntity<String> rawResponse = restTemplate.postForEntity(
                baseUrl + "/chat/completions",
                entity,
                String.class
            );
            log.info("AI Response status: {}, body: {}", rawResponse.getStatusCode(), rawResponse.getBody());

            // 3. 解析响应
            Map<String, Object> responseBody = restTemplate.postForEntity(
                baseUrl + "/chat/completions",
                entity,
                Map.class
            ).getBody();
            String answer = "";
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> msg = (Map<String, Object>) choice.get("message");
                    if (msg != null && msg.containsKey("content")) {
                        answer = (String) msg.get("content");
                    }
                }
            }

            if (answer.isEmpty()) {
                return Result.error(500, "AI 返回内容为空");
            }

            Map<String, Object> data = new HashMap<>();
            data.put("answer", answer);
            return Result.success(data);

        } catch (Exception e) {
            return Result.error(500, "AI 搜索失败: " + e.getMessage());
        }
    }
}
