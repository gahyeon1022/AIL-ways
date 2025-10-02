package auth.local.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import user.domain.ConsentType;
import auth.local.domain.LocalCredentials;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.exception.*;
import auth.local.repository.LocalCredentialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import user.domain.Consent;
import user.domain.Provider;
import user.domain.User;
import user.dto.ConsentDTO;
import user.repository.UserRepository;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SignUpService {

    private final UserRepository userRepo;
    private final LocalCredentialsRepository credRepo;
    private final EmailVerificationService emailVerService;
    private final PasswordEncoder encoder;

    public SignUpResponse signUp(SignUpRequest req) {
        // 0) 이메일 형식/정규화
        if (req.getEmail() == null) throw new InvalidEmailDomainException("이메일이 필요합니다.");
        final String email = req.getEmail().trim().toLowerCase();
        int at = email.indexOf('@');
        if (at <= 0 || at == email.length() - 1) {
            throw new InvalidEmailDomainException("올바르지 않은 이메일 형식");
        }

        // 1) 비밀번호 규칙
        if (!isStrong(req.getUserPw())) throw new WeakPasswordException();

        // --- 👇 [핵심 수정] 인증 코드 직접 확인 -> '인증 완료 상태' 확인 ---
        // 코드를 직접 확인하는 대신, 이메일 서비스에 해당 이메일이 '인증 완료' 상태인지 확인을 요청합니다.
        // 이 상태는 이전 단계의 '/api/auth/email/verify-code' API가 성공했을 때 생성됩니다.
        if (!emailVerService.isEmailVerified(email)) {
            throw new InvalidVerificationTokenException("이메일 인증이 완료되지 않았거나 만료되었습니다.");
        }

        // 3) 중복 체크 (정규화된 이메일/아이디로)
        if (userRepo.findByEmail(email).isPresent()) throw new EmailTakenException();
        if (userRepo.findByUserId(req.getUserId()).isPresent()) throw new UserIdTakenException();

        // 현재 시각 (KST → Instant 변환)
        Instant now = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toInstant();

        // 4) User 저장 (emailVerified=true로 확정 저장)
        User user = new User();
        user.setEmail(email);
        user.setUserId(req.getUserId());
        user.setUserName(req.getUserName());
        user.setProvider(Provider.LOCAL);
        user.setEmailVerified(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        user.setConsents(mapConsents(req.getConsents(), now));
        user = userRepo.save(user);

        // 5) Credentials 저장 (로그인용)
        LocalCredentials cred = new LocalCredentials();
        cred.setEmailForLogin(email);
        cred.setUserId(req.getUserId());
        cred.setPwHash(encoder.encode(req.getUserPw()));
        cred.setUserRef(user.getId());
        try {
            credRepo.save(cred);
        } catch (DuplicateKeyException e) {
            // 자격 증명 중복이면 사용자 중복으로 취급
            throw new EmailTakenException();
        }

        // --- 👇 [추가] 회원가입이 최종 완료되었으므로, 사용된 인증 정보를 무효화 ---
        emailVerService.invalidateVerification(email);

        // 6) 응답
        SignUpResponse res = new SignUpResponse();
        res.setEmail(user.getEmail());
        res.setUserId(user.getUserId());
        res.setUserName(user.getUserName());
        res.setCreatedAt(user.getCreatedAt());
        res.setConsents(toDTO(user.getConsents()));
        return res;
    }

    private boolean isStrong(String pw) {
        if (pw == null) return false;
        return pw.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$");
    }

    private List<Consent> mapConsents(List<ConsentDTO> in, Instant now) {
        if (in == null) return List.of();
        return in.stream().map(c -> {
            Consent cc = new Consent();
            cc.setType(ConsentType.valueOf(c.getType()));
            cc.setAgreed(c.isAgreed());
            cc.setAgreedAt(c.getAgreedAt() != null ? c.getAgreedAt() : now);
            return cc;
        }).toList();
    }

    private List<ConsentDTO> toDTO(List<Consent> cons) {
        if (cons == null) return List.of();
        return cons.stream().map(c -> {
            ConsentDTO d = new ConsentDTO();
            d.setType(c.getType().name());
            d.setAgreed(c.isAgreed());
            d.setAgreedAt(c.getAgreedAt());
            return d;
        }).toList();
    }

    public boolean isUserIdAvailable(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }
        return !userRepo.findByUserId(userId).isPresent();
    }
}

