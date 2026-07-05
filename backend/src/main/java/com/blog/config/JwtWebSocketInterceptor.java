package com.blog.config;

import com.blog.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;

/**
 * WebSocket 握手拦截器 — 在建立连接时校验 JWT token
 */
@Component
public class JwtWebSocketInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtWebSocketInterceptor.class);
    private final JwtUtil jwtUtil;

    public JwtWebSocketInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // 从查询参数获取 token：ws://host/ws?token=xxx
        URI uri = request.getURI();
        String query = uri.getQuery();
        if (query == null || query.isEmpty()) {
            log.warn("WebSocket 握手拒绝: 缺少 token 参数");
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        String token = null;
        for (String param : query.split("&")) {
            String[] pair = param.split("=", 2);
            if (pair.length == 2 && "token".equalsIgnoreCase(pair[0])) {
                token = pair[1];
                break;
            }
        }

        if (token == null || !jwtUtil.validateToken(token)) {
            log.warn("WebSocket 握手拒绝: token 无效");
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        // 将用户信息存入 WebSocket 会话属性
        attributes.put("userId", jwtUtil.getUserIdFromToken(token));
        attributes.put("username", jwtUtil.getUsernameFromToken(token));
        attributes.put("role", jwtUtil.getRoleFromToken(token));
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // nothing needed
    }
}
