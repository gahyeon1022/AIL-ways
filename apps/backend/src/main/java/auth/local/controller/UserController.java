package auth.local.controller;

import common.dto.ApiError;
import common.dto.ApiResponse;
import common.dto.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import user.domain.Interest;
import user.domain.Role;
import user.domain.User;
import user.dto.UpdateProfileRequest;
import user.repository.UserRepository;
import user.service.UserService;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Tag(name = "User API", description = "회원 관리 API (프로필 조회/수정, 유저 정보 관리)")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    // userRepository와 함께 userService를 주입받음
    private final UserRepository userRepository;
    private final UserService userService;

    // 전체 조회: GET api/users
    @Operation(summary = "전체 유저 조희", description = "등록된 전체 유저 조희")
    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {
        return ApiResponse.ok(userRepository.findAll());
    }

    // GET api/users/me
    @Operation(summary = "내 정보 조희", description = "내 정보 조희")
    @GetMapping("/me")
    public ApiResponse<User> getUserByUserId(Authentication auth) { //토큰 기반
        String userId = auth.getName();
        return userRepository.findByUserId(userId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error(new ApiError(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다.")));
    }

    @Operation(summary = "유저 프로필 수정", description = "JWT 인증 필요. 본인 프로필 정보 업데이트")
    @PatchMapping("/me/profile")
    public ApiResponse<User> updateUserProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest req) {
        String userId = auth.getName();
        try {
            User updatedUser = userService.updateUserProfile(userId, req.getInterests(), req.getRole());
            return ApiResponse.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(new ApiError(ErrorCode.USER_NOT_FOUND, "사용자를 찾을 수 없습니다."));
        }
    }
    @Operation(summary = "프로필 선택 옵션 조회", description = "회원가입 또는 프로필 수정 시 선택 가능한 역할 및 흥미 목록을 조회합니다.")
    @GetMapping("/profile-options")
    public ApiResponse<Map<String, List<String>>> getProfileOptions() {
        Map<String, List<String>> options = new HashMap<>();

        List<String> roles = Arrays.stream(Role.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        options.put("roles", roles);

        List<String> interests = Arrays.stream(Interest.values())
                .map(Enum::name)
                .collect(Collectors.toList());
        options.put("interests", interests);

        return ApiResponse.ok(options);
    }
}
