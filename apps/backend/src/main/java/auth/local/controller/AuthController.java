package auth.local.controller;

import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.service.EmailVerificationService;
import auth.local.service.SignUpService;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmailVerificationService emailVerifSvc;
    private final SignUpService signUpSvc;

    public AuthController(EmailVerificationService emailVerifSvc, SignUpService signUpSvc) {
        this.emailVerifSvc = emailVerifSvc;
        this.signUpSvc = signUpSvc;
    }

    // 1) 이메일로 인증코드 보내기
    @PostMapping("/email/code")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody @Valid SendCodeReq req) {
        emailVerifSvc.sendCode(req.email());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // 2) 회원가입 (코드 직접 검증 -> SignUpService에서 수행)
    @PostMapping("/local/signup")
    public ResponseEntity<SignUpResponse> signup(@RequestBody @Valid SignUpRequest req) {
        SignUpResponse res = signUpSvc.signUp(req);
        // Location 헤더에 신규 리소스 위치(예시: /api/users/{userId})
        URI location = URI.create("/api/users/" + res.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).location(location).body(res);
    }

    // DTO (record)
    public record SendCodeReq(@NotBlank @Email String email) {}
}
