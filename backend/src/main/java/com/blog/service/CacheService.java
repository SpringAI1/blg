package com.blog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.Set;

@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    /** 统一的缓存键前缀 */
    public static final String KEY_PREFIX = "blog:";

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private final ObjectMapper objectMapper;

    public CacheService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /** 为缓存键添加统一前缀 */
    public static String prefixed(String key) {
        return key.startsWith(KEY_PREFIX) ? key : KEY_PREFIX + key;
    }

    /**
     * 存储对象到缓存
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(prefixed(key), value, timeout, unit);
        } catch (Exception e) {
            log.error("Redis set failed for key: {}", key, e);
        }
    }

    public void setWithDuration(String key, Object value, Duration duration) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.opsForValue().set(prefixed(key), value, duration);
        } catch (Exception e) {
            log.error("Redis setWithDuration failed for key: {}", key, e);
        }
    }

    /**
     * 从缓存获取对象
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key, Class<T> clazz) {
        if (redisTemplate == null) {
            return null;
        }
        try {
            Object value = redisTemplate.opsForValue().get(prefixed(key));
            if (value == null) {
                return null;
            }
            if (clazz.isInstance(value)) {
                return (T) value;
            }
            String json = objectMapper.writeValueAsString(value);
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            log.error("Redis get failed for key: {}", key, e);
            return null;
        }
    }

    public void delete(String key) {
        if (redisTemplate == null) {
            return;
        }
        try {
            redisTemplate.delete(prefixed(key));
        } catch (Exception e) {
            log.error("Redis delete failed for key: {}", key, e);
        }
    }

    /**
     * 按模式删除缓存键（模式本身不需要加前缀）
     */
    public void deleteByPattern(String pattern) {
        if (redisTemplate == null) {
            return;
        }
        try {
            Set<String> keys = redisTemplate.keys(prefixed(pattern));
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            log.error("Redis deleteByPattern failed for pattern: {}", pattern, e);
        }
    }

    public boolean exists(String key) {
        if (redisTemplate == null) {
            return false;
        }
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(prefixed(key)));
        } catch (Exception e) {
            log.error("Redis exists failed for key: {}", key, e);
            return false;
        }
    }

    public Long getExpire(String key) {
        if (redisTemplate == null) {
            return null;
        }
        try {
            return redisTemplate.getExpire(prefixed(key));
        } catch (Exception e) {
            log.error("Redis getExpire failed for key: {}", key, e);
            return null;
        }
    }
}
