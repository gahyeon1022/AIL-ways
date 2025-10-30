package auth.local.controller;

import auth.local.dto.LoginRequest;
import auth.local.dto.LoginResponse;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.service.EmailVerificationService;
import auth.local.service.LoginService;
import auth.local.service.LogoutService;
import auth.local.service.SignUpService;

import common.security.jwt.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import common.dto.ApiResponse;
import common.dto.ApiError;
import common.dto.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import jakarta.servlet.http.HttpServletRequest;
import user.dto.ConsentDTO;
import user.service.UserService;

import java.util.List;
import java.util.Map;

@Tag(name = "Auth API", description = "회원가입 / 로그인 / 이메일 인증 등 인증 관련 API")
@RestController
@RequestMapping("/api/auth") //url 프리픽스, 해당 어노테이션(RequestMapping)이 적용된 것들은 기본적으로 앞에 이 url이 붙음
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final EmailVerificationService emailVerifSvc;
    private final SignUpService signUpSvc;
    private final LoginService loginSvc; // <<< 1. LoginService 필드 추가
    private final JwtUtil jwtUtil; // <<< Add jwtUtil field
    private final LogoutService logoutSvc;
    private final UserService userSvc;
    // <<< 2. 생성자 파라미터에 LoginService, JwtUtil 추가
    public AuthController(EmailVerificationService emailVerifSvc, SignUpService signUpSvc, LoginService loginSvc, JwtUtil jwtUtil,  LogoutService logoutSvc, UserService userSvc) {
        this.emailVerifSvc = emailVerifSvc;
        this.signUpSvc = signUpSvc;
        this.loginSvc = loginSvc; // <<< 3. 주입받은 loginSvc를 필드에 할당.
        this.jwtUtil = jwtUtil; // <<< Assign jwtUtil
        this.logoutSvc = logoutSvc;
        this.userSvc = userSvc;
    }

    // 1) 이메일로 인증코드 보내기
    @Operation(summary = "이메일 인증", description = "입력한 이메일에 대해 인증코드 발송")
    @PostMapping("/email/code") // /api/auth/email/code
    public ApiResponse<Map<String, Object>> sendCode(@RequestBody @Valid SendCodeReq req) {
        emailVerifSvc.sendCode(req.email());
        return ApiResponse.ok(Map.of("ok", true));
    }

    @Operation(summary = "이메일 인증코드 확인", description = "이메일과 코드가 유효한지 확인")
    @PostMapping("/email/verify-code")
    public ApiResponse<Map<String, Object>> verifyCode(@RequestBody @Valid VerifyCodeReq req) {
        boolean isVerified = emailVerifSvc.verifyCode(req.email(), req.code());
        if (isVerified) {
            return ApiResponse.ok(Map.of("verified", true, "message", "인증에 성공했습니다."));
        } else {
            return ApiResponse.error(new ApiError(ErrorCode.INVALID_CODE, "인증코드가 일치하지 않거나 만료되었습니다."));
        }
    }

    // 2) 회원가입 (코드 직접 검증 -> SignUpService에서 수행)
    @Operation(summary = "회원가입", description = "로컬 계정 회원가입 (이메일 인증 코드 포함)")
    @PostMapping("/local/signup") // /api/auth/local/signup
    public ApiResponse<SignUpResponse> signup(@RequestBody @Valid SignUpRequest req) {
        SignUpResponse res = signUpSvc.signUp(req);
        return ApiResponse.ok(res);
    }


    /** 로컬 로그인 */
    @Operation(summary = "로컬 로그인", description = "이메일 + 비밀번호 기반 로그인 후 JWT 발급")
    @PostMapping("/local/login") // /api/auth/local/login
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse result = loginSvc.login(req);
        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", jwtUtil.generateToken(result.getUserId()));
        body.put("refreshToken", jwtUtil.generateRefreshToken(result.getUserId()));
        body.put("tokenType", "Bearer");
        body.put("userId", result.getUserId());
        return ApiResponse.ok(body);
    }

    @Operation(summary = "아이디 중복 체크", description = "입력한 userId가 사용 가능한지 확인")
    @GetMapping("/check-userid")
    public ApiResponse<Map<String, Boolean>> checkUserId(@RequestParam("userId") String userId) {
        boolean isAvailable = signUpSvc.isUserIdAvailable(userId);
        return ApiResponse.ok(Map.of("isAvailable", isAvailable));
    }

    @Operation(summary = "약관 동의 저장", description = "소셜 최초 로그인 시 사용자가 약관에 동의한 내역을 저장합니다.")
    @PostMapping("/social/consents")
    public ApiResponse<Map<String, String>> saveUserConsents(
            @RequestBody @Valid List<ConsentDTO> consents,
            Authentication auth
    ) {
        String userId = auth.getName(); // 로그인한 사용자 이메일

        userSvc.saveConsents(userId, consents);
        return ApiResponse.ok(Map.of("message", "약관 동의가 저장되었습니다."));
    }

    @Operation(summary = "로그아웃", description = "현재 사용자의 토큰을 무효화합니다.")
    @PostMapping("/logout")
    public ApiResponse<Map<String, String>> logout(HttpServletRequest request) {
        // 클라이언트 요청 헤더에서 Access Token을 추출
        String token = jwtUtil.resolveToken(request); // (JwtUtil에 이 메소드가 구현되어 있어야 함)

        // LogoutService를 호출하여 토큰을 블랙리스트에 추가
        logoutSvc.logout(token);

        return ApiResponse.ok(Map.of("message", "성공적으로 로그아웃되었습니다."));
    }

    // DTO (record)
    public record SendCodeReq(@NotBlank @Email String email) {}
    public record VerifyCodeReq(@NotBlank @Email String email, @NotBlank String code) {}

}