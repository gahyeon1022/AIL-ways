package auth.local.service;

import auth.local.domain.EmailCode;
import auth.local.exception.InvalidCodeException;
import auth.local.repository.EmailCodeRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class EmailVerificationService {
    private final EmailCodeRepository codeRepo;
    private final EmailService emailService;
    private final SecureRandom rnd = new SecureRandom();

    public EmailVerificationService(EmailCodeRepository codeRepo, EmailService emailService) {
        this.codeRepo = codeRepo;
        this.emailService = emailService;
    }

    // 인증코드 발송 (TTL: 5분)
    public void sendCode(String email) {
        String code = String.format("%06d", rnd.nextInt(1_000_000));

        EmailCode ec = new EmailCode();
        ec.setEmail(email);
        ec.setCode(code);
        ec.setAttempts(0);
        ec.setUsed(false);
        ec.setExpireAt(Instant.now().plusSeconds(60 * 5)); // 5분 후 만료
        codeRepo.save(ec);

        emailService.sendCode(email, code);
    }

    // 코드 검증 (회원가입에서 바로 사용)
    public boolean verifyCode(String email, String codeInput) {
        EmailCode ec = codeRepo.findTopByEmailAndUsedIsFalseOrderByExpireAtDesc(email)
                .orElseThrow(InvalidCodeException::new);

        if (ec.getExpireAt() == null || ec.getExpireAt().isBefore(Instant.now())) {
            throw new InvalidCodeException(); // 만료
        }

        if (ec.getAttempts() >= 5) {
            throw new InvalidCodeException(); // 시도 횟수 초과
        }

        if (!ec.getCode().equals(codeInput)) {
            ec.setAttempts(ec.getAttempts() + 1);
            codeRepo.save(ec);
            throw new InvalidCodeException(); // 불일치
        }

        ec.setUsed(true);
        codeRepo.save(ec);
        return true;
    }
}
