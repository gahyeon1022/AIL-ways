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

    // 인증코드 발송 (수정 없음)
    public void sendCode(String email) {
        String normEmail = normalize(email);
        String code = String.format("%06d", rnd.nextInt(1_000_000));

        EmailCode ec = new EmailCode();
        ec.setEmail(normEmail);
        ec.setCode(code);
        ec.setAttempts(0);
        ec.setUsed(false);
        ec.setVerified(false); // [추가] 초기 상태는 false
        ec.setCreatedAt(Instant.now());
        ec.setExpireAt(Instant.now().plusSeconds(60 * 5)); // 5분 후 만료
        codeRepo.save(ec);

        emailService.sendCode(normEmail, code);
    }

    // --- 👇 [수정] 인증번호를 '검증'하고 '인증 완료' 상태로 변경 ---
    public boolean verifyCode(String email, String codeInput) {
        String normEmail = normalize(email);
        EmailCode ec = codeRepo
                .findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(normEmail)
                .orElseThrow(InvalidCodeException::new);

        // 만료, 시도 횟수, 코드 불일치 검사 (기존과 동일)
        if (ec.getExpireAt() == null || ec.getExpireAt().isBefore(Instant.now())) {
            throw new InvalidCodeException("만료된 코드입니다.");
        }
        if (ec.getAttempts() >= 5) {
            throw new InvalidCodeException("시도 횟수를 초과했습니다.");
        }
        if (!ec.getCode().equals(codeInput)) {
            ec.setAttempts(ec.getAttempts() + 1);
            codeRepo.save(ec);
            throw new InvalidCodeException("인증코드가 일치하지 않습니다.");
        }

        // '사용됨(used)' 대신 '인증됨(verified)' 상태로 변경
        ec.setVerified(true);
        ec.setVerifiedAt(Instant.now());
        codeRepo.save(ec);

        return true;
    }

    // --- 👇 [신규] 최종 회원가입 시, 이메일이 인증된 상태인지 확인하는 메서드 ---
    public boolean isEmailVerified(String email) {
        String normEmail = normalize(email);
        return codeRepo.findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(normEmail)
                .map(ec -> ec.isVerified() && ec.getVerifiedAt() != null && ec.getVerifiedAt().isAfter(Instant.now().minusSeconds(60 * 10))) // 인증 후 10분 이내에만 유효
                .orElse(false);
    }

    // --- 👇 [신규] 회원가입 완료 후, 인증 정보를 '최종 사용' 처리하는 메서드 ---
    public void invalidateVerification(String email) {
        String normEmail = normalize(email);
        codeRepo.findTopByEmailAndUsedIsFalseOrderByCreatedAtDesc(normEmail)
                .ifPresent(ec -> {
                    ec.setUsed(true); // 이제 이 코드는 완전히 사용됨
                    codeRepo.save(ec);
                });
    }

    private String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
