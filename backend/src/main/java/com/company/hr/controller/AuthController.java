package com.company.hr.controller;

import com.company.hr.entity.User;
import com.company.hr.service.UserService;
import com.company.hr.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginRequest request) {
        // 模拟登录验证
        if ("admin".equals(request.getUsername()) && "123456".equals(request.getPassword())) {
            Map<String, Object> data = new HashMap<>();
            data.put("token", "mock_token_" + System.currentTimeMillis());
            data.put("userInfo", Map.of(
                "username", request.getUsername(),
                "name", "管理员",
                "role", "admin",
                "avatar", null
            ));
            return Result.success(data);
        }
        return Result.error(401, "用户名或密码错误");
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success(null);
    }

    @GetMapping("/info")
    public Result<Map<String, Object>> getUserInfo(@RequestHeader("Authorization") String token) {
        Map<String, Object> data = new HashMap<>();
        data.put("username", "admin");
        data.put("name", "管理员");
        data.put("role", "admin");
        data.put("avatar", null);
        return Result.success(data);
    }

    @PostMapping("/change-password")
    public Result<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        // 模拟修改密码
        return Result.success(null);
    }

    // 请求DTO
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}