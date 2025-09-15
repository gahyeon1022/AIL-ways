package auth.local.controller;// package com.ailways.alpha.controller;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.service.EmailVerificationService;
import auth.local.service.SignUpService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmailVerificationService emailVerService;
    private final SignUpService signUpService;

    public AuthController(EmailVerificationService emailVerService, SignUpService signUpService) {
        this.emailVerService = emailVerService;
        this.signUpService = signUpService;
    }

    // 1) 코드 발송
    @PostMapping("/email/send-code")
    public ResponseEntity<Void> sendCode(@RequestParam @Email String email) {
        emailVerService.sendCode(email);
        return ResponseEntity.ok().build();
    }

    // 2) 코드 검증 → 토큰 발급
    @PostMapping("/email/verify")
    public ResponseEntity<String> verify(@RequestParam @Email String email,
                                         @RequestParam @NotBlank String code) {
        String token = emailVerService.verifyAndIssueToken(email, code);
        return ResponseEntity.ok(token); // 클라이언트가 이 토큰을 회원가입 때 같이 보냄
    }

    // 3) 회원가입 (토큰 필요)
    @PostMapping("/signup")
    public ResponseEntity<SignUpResponse> signUp(@RequestBody SignUpRequest req,
                                                 @RequestParam("verificationToken") String token) {
        // 토큰으로 이메일 검증/소유 확인
        String verifiedEmail = emailVerService.ensureVerifiedEmail(token);
        if (!verifiedEmail.equalsIgnoreCase(req.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(signUpService.signUp(req));
    }
}
