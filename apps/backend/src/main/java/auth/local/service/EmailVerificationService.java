package auth.local.service;

import auth.local.domain.EmailCode;
import auth.local.exception.InvalidCodeException;
import auth.local.repository.EmailCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor

public class EmailVerificationService {

    private final EmailCodeRepository codeRepo;
    private final EmailService emailService;
    private final SecureRandom rnd = new SecureRandom();

    // 인증코드 발송 (TTL: 5분)
    public void sendCode(String email) {
        String normEmail = normalize(email);
        String code = String.format("%06d", rnd.nextInt(1_000_000));

        EmailCode ec = new EmailCode();
        ec.setEmail(normEmail);
        ec.setCode(code);
        ec.setAttempts(0);
        ec.setUsed(false);
        ec.setCreatedAt(Instant.now());                    // ✅ 생성 시각 추가
        ec.setExpireAt(Instant.now().plusSeconds(60 * 5));
        codeRepo.save(ec);

        emailService.sendCode(normEmail, code);
    }

    public boolean verifyCode(String email, String codeInput) {
        String normEmail = normalize(email);

        // ✅ 최신 미사용 코드 가져오기 (createdAt DESC)
        EmailCode ec = codeRepo
                .findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(normEmail)
                .orElseThrow(InvalidCodeException::new);

        if (ec.getExpireAt() == null || ec.getExpireAt().isBefore(Instant.now())) {
            throw new InvalidCodeException(); // 만료
        }
        if (ec.getAttempts() >= 5) {
            throw new InvalidCodeException(); // 시도 초과
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


    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
