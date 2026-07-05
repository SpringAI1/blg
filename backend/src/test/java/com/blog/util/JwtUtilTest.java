package com.blog.util;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.lang.reflect.Field;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    private static final String TEST_SECRET =
            "test-jwt-secret-key-for-unit-tests-with-at-least-256-bits-length!";

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        jwtUtil = new JwtUtil();

        setField(jwtUtil, "secret", TEST_SECRET);
        setField(jwtUtil, "expiration", 86400000L);
        setField(jwtUtil, "redisTemplate", redisTemplate);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    private void setField(Object target, String fieldName, Object value)
            throws Exception {
        Field field = JwtUtil.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        String token = jwtUtil.generateToken(1L, "testuser", "USER");

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertEquals(3, token.split("\\.").length,
                "JWT should have header, payload, and signature");
    }

    @Test
    void validateToken_ShouldReturnTrue_ForValidToken() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(1L, "testuser", "USER");

        assertTrue(jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_ForExpiredToken() throws Exception {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        JwtUtil expiredJwtUtil = new JwtUtil();
        setField(expiredJwtUtil, "secret", TEST_SECRET);
        setField(expiredJwtUtil, "expiration", -1000L);
        setField(expiredJwtUtil, "redisTemplate", redisTemplate);

        String token = expiredJwtUtil.generateToken(1L, "testuser", "USER");

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_ForMalformedToken() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        assertFalse(jwtUtil.validateToken("malformed.token.here"));
        assertFalse(jwtUtil.validateToken(""));
        assertFalse(jwtUtil.validateToken("not.a.valid.jwt"));
        assertFalse(jwtUtil.validateToken("random-string-without-dots"));
    }

    @Test
    void getUserIdFromToken_ShouldReturnCorrectUserId() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(42L, "testuser", "USER");

        assertEquals(42L, jwtUtil.getUserIdFromToken(token));
    }

    @Test
    void getUsernameFromToken_ShouldReturnCorrectUsername() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(1L, "john_doe", "USER");

        assertEquals("john_doe", jwtUtil.getUsernameFromToken(token));
    }

    @Test
    void getRoleFromToken_ShouldReturnCorrectRole() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(1L, "admin_user", "ADMIN");

        assertEquals("ADMIN", jwtUtil.getRoleFromToken(token));
    }

    @Test
    void blacklistToken_ShouldAddTokenToRedis() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(1L, "testuser", "USER");

        jwtUtil.blacklistToken(token);

        verify(valueOperations).set(
                contains("blog:token:blacklist:" + token),
                eq("1"),
                anyLong(),
                eq(TimeUnit.MILLISECONDS)
        );
    }

    @Test
    void isBlacklisted_ShouldReturnTrue_ForBlacklistedToken() {
        String token = jwtUtil.generateToken(1L, "testuser", "USER");
        when(redisTemplate.hasKey("blog:token:blacklist:" + token))
                .thenReturn(true);

        assertTrue(jwtUtil.isBlacklisted(token));
    }

    @Test
    void isBlacklisted_ShouldReturnFalse_ForNonBlacklistedToken() {
        String token = jwtUtil.generateToken(1L, "testuser", "USER");
        when(redisTemplate.hasKey("blog:token:blacklist:" + token))
                .thenReturn(false);

        assertFalse(jwtUtil.isBlacklisted(token));
    }

    @Test
    void validateToken_ShouldReturnFalse_ForBlacklistedToken() {
        String token = jwtUtil.generateToken(1L, "testuser", "USER");
        when(redisTemplate.hasKey("blog:token:blacklist:" + token))
                .thenReturn(true);

        assertFalse(jwtUtil.validateToken(token));
    }

    @Test
    void parseToken_ShouldReturnCorrectClaims() {
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token = jwtUtil.generateToken(100L, "claimUser", "EDITOR");
        Claims claims = jwtUtil.parseToken(token);

        assertEquals("claimUser", claims.getSubject());
        assertEquals(100L, claims.get("userId", Long.class));
        assertEquals("EDITOR", claims.get("role", String.class));
    }
}
