package auth.local.controller;

import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.service.EmailVerificationService;
import auth.local.service.SignUpService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody SendCodeReq req) {
        emailVerifSvc.sendCode(req.email());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // 2) 회원가입 (코드 직접 검증)
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signup(@RequestBody SignUpRequest req) {
        return ResponseEntity.ok(signUpSvc.signUp(req));
    }

    // DTO (record)
    public record SendCodeReq(@NotBlank @Email String email) {}
}
