package com.blog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CacheService {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private final ObjectMapper objectMapper;

    public CacheService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * 存储对象到缓存 — 利用 RedisTemplate 的 GenericJackson2JsonRedisSerializer 自动序列化
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(key, value, timeout, unit);
        } catch (Exception e) {
            System.err.println("Redis set failed: " + e.getMessage());
        }
    }

    public void setWithDuration(String key, Object value, Duration duration) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(key, value, duration);
        } catch (Exception e) {
            System.err.println("Redis setWithDuration failed: " + e.getMessage());
        }
    }

    /**
     * 从缓存获取对象 — 反序列化为指定类型
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> clazz) {
        if (redisTemplate == null) {
            return null;
        }
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return null;
            }
            if (clazz.isInstance(value)) {
                return (T) value;
            }
            String json = objectMapper.writeValueAsString(value);
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            System.err.println("Redis get failed: " + e.getMessage());
            return null;
        }
    }

    public void delete(String key) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            System.err.println("Redis delete failed: " + e.getMessage());
        }
    }

    /**
     * 按模式删除缓存键
     */
    public void deleteByPattern(String pattern) {
        if (redisTemplate == null) {
            return;
        }
        try {
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            System.err.println("Redis deleteByPattern failed: " + e.getMessage());
        }
    }

    public boolean exists(String key) {
        if (redisTemplate == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            System.err.println("Redis exists failed: " + e.getMessage());
            return false;
        }
    }

    public Long getExpire(String key) {
        if (redisTemplate == null) {
            return null;
        }
        try {
            return redisTemplate.getExpire(key);
        } catch (Exception e) {
            System.err.println("Redis getExpire failed: " + e.getMessage());
            return null;
        }
    }
}
