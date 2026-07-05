package com.blog.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class JwtUtil {

    private static final String BLACKLIST_PREFIX = "blog:token:blacklist:";

    @Value("${jwt.secret:blog-jwt-secret-key-2024-personal-blog-system-with-enough-length}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private long expiration;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseToken(token);
            // 检查 token 是否在黑名单中
            if (isBlacklisted(token)) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("userId", Long.class);
    }

    public String getUsernameFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    /**
     * 将 token 加入黑名单（登出时调用）
     */
    public void blacklistToken(String token) {
        if (redisTemplate == null) {
            return;
        }
        try {
            Claims claims = parseToken(token);
            long ttl = claims.getExpiration().getTime() - System.currentTimeMillis();
            if (ttl > 0) {
                redisTemplate.opsForValue().set(
                    BLACKLIST_PREFIX + token,
                    "1",
                    ttl,
                    TimeUnit.MILLISECONDS
                );
            }
        } catch (Exception e) {
            // ignore invalid token
        }
    }

    /**
     * 检查 token 是否在黑名单中
     */
    public boolean isBlacklisted(String token) {
        if (redisTemplate == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
        } catch (Exception e) {
            return false;
        }
    }
}
