package auth.local.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import user.domain.User;
import user.dto.UpdateProfileRequest;
import user.repository.UserRepository;
import user.service.UserService;

import java.util.List;

@Tag(name = "User API", description = "회원 관리 API (프로필 조회/수정, 유저 정보 관리)")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    // userRepository와 함께 userService를 주입받음
    private final UserRepository userRepository;
    private final UserService userService;

    // 전체 조회: GET /users
    @Operation(summary = "전체 유저 조희", description = "등록된 전체 유저 조희")
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET /users/me
    @Operation(summary = "내 정보 조희", description = "내 정보 조희")
    @GetMapping("/me")
    public ResponseEntity<User> getUserByUserId(Authentication auth) { //토큰 기반
        String userId = auth.getName();
        return userRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "유저 프로필 수정", description = "JWT 인증 필요. 본인 프로필 정보 업데이트")
    @PatchMapping("/me/profile")
    public ResponseEntity<User> updateUserProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest req) {
        String userId = auth.getName();
        try {
            User updatedUser = userService.updateUserProfile(userId, req.getInterests(), req.getRole());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
