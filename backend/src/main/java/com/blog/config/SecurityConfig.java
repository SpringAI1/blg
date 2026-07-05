package com.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jsonAuthenticationEntryPoint())
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 公开接口 — 无需登录
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/logout",
                    "/uploads/**",
                    "/api/files/upload"
                ).permitAll()
                // 文章 — GET 公开，写操作需认证
                .requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()
                // 分类/标签 — 公开读取
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/tags/**").permitAll()
                // 用户信息 — 公开读取
                .requestMatchers(HttpMethod.GET, "/api/users/*").permitAll()
                // 会议 — GET 公开，写操作需认证；WebSocket 端点公开
                .requestMatchers(HttpMethod.GET, "/api/meetings**", "/api/meetings/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // 搜索 — 公开
                .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                // 下载资源 — 公开读取和下载
                .requestMatchers(HttpMethod.GET, "/api/downloads/**").permitAll()
                // 收藏/关注 — check 接口公开
                .requestMatchers(HttpMethod.GET, "/api/favorites/check/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/follows/check/**").permitAll()
                // 管理接口 — 需要 ADMIN 角色
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")
                // 其它所有接口需要认证
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // 生产环境应配置具体的允许域名
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 自定义认证入口点 — 返回 JSON 格式的 401 而非 Spring Security 默认的 403 页面
     */
    @Bean
    public AuthenticationEntryPoint jsonAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.setStatus(401);
            response.getWriter().write("{\"code\":401,\"message\":\"请先登录\",\"data\":null}");
        };
    }
}