package auth.local.service;// package com.ailways.alpha.service;
import auth.local.domain.EmailCode;
import auth.local.domain.EmailVerification;
import auth.local.repository.EmailCodeRepository;
import auth.local.repository.EmailVerificationRepository;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailVerificationService {
    private final EmailCodeRepository codeRepo;
    private final EmailVerificationRepository verRepo;
    private final EmailService emailService;
    private final SecureRandom rnd = new SecureRandom();

    public EmailVerificationService(EmailCodeRepository codeRepo,
                                    EmailVerificationRepository verRepo,
                                    EmailService emailService) {
        this.codeRepo = codeRepo;
        this.verRepo = verRepo;
        this.emailService = emailService;
    }

    public void sendCode(String email) {
        String code = String.format("%06d", rnd.nextInt(1_000_000));
        EmailCode ec = new EmailCode();
        ec.setEmail(email);
        ec.setCode(code);
        ec.setExpireAt(Instant.now()); // TTL 인덱스가 기준 (지금 기록 시각 + 5분으로 관리)
        codeRepo.save(ec);
        emailService.sendCode(email, code);
    }

    public String verifyAndIssueToken(String email, String codeInput) {
        EmailCode ec = codeRepo.findTopByEmailAndUsedIsFalseOrderByExpireAtDesc(email)
                .orElseThrow(InvalidCodeException::new);

        if (ec.getAttempts() >= 5) throw new InvalidCodeException(); // 과도 입력 방지

        if (!ec.getCode().equals(codeInput)) {
            ec.setAttempts(ec.getAttempts() + 1);
            codeRepo.save(ec);
            throw new InvalidCodeException();
        }
        ec.setUsed(true);
        codeRepo.save(ec);

        EmailVerification v = new EmailVerification();
        v.setEmail(email);
        v.setToken(UUID.randomUUID().toString());
        v.setExpireAt(Instant.now()); // TTL 15분
        verRepo.save(v);
        return v.getToken();
    }

    public String ensureVerifiedEmail(String token) {
        EmailVerification v = verRepo.findByTokenAndUsedIsFalse(token)
                .orElseThrow(InvalidVerificationTokenException::new);
        v.setUsed(true);
        verRepo.save(v);
        return v.getEmail();
    }
}
