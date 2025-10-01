package auth.local.controller;

import auth.local.dto.LoginRequest;
import auth.local.dto.LoginResponse;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.service.EmailVerificationService;
import auth.local.service.LoginService;
import auth.local.service.SignUpService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Auth API", description = "회원가입 / 로그인 / 이메일 인증 등 인증 관련 API")
@RestController
@RequestMapping("/api/auth") //url 프리픽스, 해당 어노테이션(RequestMapping)이 적용된 것들은 기본적으로 앞에 이 url이 붙음
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final EmailVerificationService emailVerifSvc;
    private final SignUpService signUpSvc;
    private final LoginService loginSvc; // <<< 1. LoginService 필드 추가

    // <<< 2. 생성자 파라미터에 LoginService 추가
    public AuthController(EmailVerificationService emailVerifSvc, SignUpService signUpSvc, LoginService loginSvc) {
        this.emailVerifSvc = emailVerifSvc;
        this.signUpSvc = signUpSvc;
        this.loginSvc = loginSvc; // <<< 3. 주입받은 loginSvc를 필드에 할당.
    }

    // 1) 이메일로 인증코드 보내기
    @Operation(summary = "이메일 인증", description = "입력한 이메일에 대해 인증코드 발송")
    @PostMapping("/email/code") // /api/auth/email/code
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody @Valid SendCodeReq req) {
        emailVerifSvc.sendCode(req.email());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // 2) 회원가입 (코드 직접 검증 -> SignUpService에서 수행)
    @Operation(summary = "회원가입", description = "로컬 계정 회원가입 (이메일 인증 코드 포함)")
    @PostMapping("/local/signup") // /api/auth/local/signup
    public ResponseEntity<SignUpResponse> signup(@RequestBody @Valid SignUpRequest req) {
        SignUpResponse res = signUpSvc.signUp(req);
        URI location = URI.create("/api/users/" + res.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).location(location).body(res);
    }

    /** 로컬 로그인 */
    @Operation(summary = "로컬 로그인", description = "이메일 + 비밀번호 기반 로그인 후 JWT 발급")
    @PostMapping("/local/login") // /api/auth/local/login
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse result = loginSvc.login(req);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("data", result);
        body.put("error", null); // ✅ HashMap 은 null 허용

        return ResponseEntity.ok(body);
    }


    // DTO (record)
    public record SendCodeReq(@NotBlank @Email String email) {}
}