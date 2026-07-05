package com.blog.controller;

import com.blog.config.JwtAuthenticationFilter;
import com.blog.config.SecurityConfig;
import com.blog.dto.UserDTO;
import com.blog.entity.User;
import com.blog.service.UserService;
import com.blog.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        // JwtAuthenticationFilter is mocked and does nothing by default
        // All auth endpoints are permitAll() in SecurityConfig
    }

    // ── login ──────────────────────────────────────────────────────

    @Test
    void login_WithValidCredentials_ShouldReturn200WithToken() throws Exception {
        String username = "testuser";
        String password = "password123";
        String token = "jwt.token.here";

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername(username);
        mockUser.setPassword("encoded_password");
        mockUser.setRole("USER");

        UserDTO mockUserDTO = new UserDTO();
        mockUserDTO.setId(1L);
        mockUserDTO.setUsername(username);
        mockUserDTO.setRole("USER");

        when(userService.getUserByUsernameEntity(username)).thenReturn(mockUser);
        when(passwordEncoder.matches(password, "encoded_password")).thenReturn(true);
        when(jwtUtil.generateToken(1L, username, "USER")).thenReturn(token);
        when(userService.getUserById(1L)).thenReturn(mockUserDTO);

        Map<String, String> requestBody = Map.of("username", username, "password", password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.token").value(token))
                .andExpect(jsonPath("$.data.user.username").value(username))
                .andExpect(jsonPath("$.data.user.role").value("USER"));

        verify(userService).getUserByUsernameEntity(username);
        verify(passwordEncoder).matches(password, "encoded_password");
        verify(jwtUtil).generateToken(1L, username, "USER");
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturn401() throws Exception {
        String username = "testuser";
        String password = "wrongpassword";

        when(userService.getUserByUsernameEntity(username)).thenReturn(null);

        Map<String, String> requestBody = Map.of("username", username, "password", password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value(containsString("用户名或密码错误")));

        verify(userService).getUserByUsernameEntity(username);
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void login_WithWrongPassword_ShouldReturn401() throws Exception {
        String username = "testuser";
        String password = "wrongpassword";

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername(username);
        mockUser.setPassword("encoded_password");
        mockUser.setRole("USER");

        when(userService.getUserByUsernameEntity(username)).thenReturn(mockUser);
        when(passwordEncoder.matches(password, "encoded_password")).thenReturn(false);

        Map<String, String> requestBody = Map.of("username", username, "password", password);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value(containsString("用户名或密码错误")));
    }

    // ── register ───────────────────────────────────────────────────

    @Test
    void register_WithValidData_ShouldReturn200() throws Exception {
        String json = """
                {
                    "username": "newuser",
                    "password": "password123",
                    "email": "newuser@example.com"
                }
                """;

        User registeredUser = new User();
        registeredUser.setId(3L);
        registeredUser.setUsername("newuser");
        registeredUser.setEmail("newuser@example.com");
        registeredUser.setRole("USER");

        when(userService.register("newuser", "password123", "newuser@example.com"))
                .thenReturn(registeredUser);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(userService).register("newuser", "password123", "newuser@example.com");
    }

    @Test
    void register_WithInvalidEmail_ShouldReturn400() throws Exception {
        String json = """
                {
                    "username": "newuser",
                    "password": "password123",
                    "email": "not-an-email"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("邮箱格式不正确"));

        verify(userService, never()).register(anyString(), anyString(), anyString());
    }

    @Test
    void register_WithEmptyUsername_ShouldReturn400() throws Exception {
        String json = """
                {
                    "username": "",
                    "password": "password123",
                    "email": "user@example.com"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void register_WithShortPassword_ShouldReturn400() throws Exception {
        String json = """
                {
                    "username": "newuser",
                    "password": "123",
                    "email": "user@example.com"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("密码长度不能少于6位"));
    }

    // ── logout ─────────────────────────────────────────────────────

    @Test
    void logout_WithAuthorizationHeader_ShouldCallBlacklistToken() throws Exception {
        String token = "test.jwt.token";

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(jwtUtil).blacklistToken(token);
    }

    @Test
    void logout_WithoutBearerPrefix_ShouldNotCallBlacklistToken() throws Exception {
        String token = "test.jwt.token";

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", token))
                .andExpect(status().isOk());

        verify(jwtUtil, never()).blacklistToken(anyString());
    }

    @Test
    void logout_WithoutAuthorizationHeader_ShouldReturnEmptySuccess() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(jwtUtil, never()).blacklistToken(anyString());
    }
}
