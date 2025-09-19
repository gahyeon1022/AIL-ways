package auth.local.service;

import user.domain.ConsentType;
import auth.local.domain.LocalCredentials;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.exception.*;
import auth.local.repository.LocalCredentialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import user.domain.Consent;
import user.domain.User;
import user.dto.ConsentDTO;
import user.repository.UserRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SignUpService {

    private final UserRepository userRepo;
    private final LocalCredentialsRepository credRepo;
    private final EmailVerificationService emailVerService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

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

        // 2) 이메일 인증 코드 검증 (성공 시점에 코드 used=true 처리)
        boolean verified = emailVerService.verifyCode(email, req.getCode());
        if (!verified) throw new IllegalStateException("이메일 인증 실패");

        // 3) 중복 체크 (정규화된 이메일/아이디로)
        if (userRepo.findByEmail(email).isPresent()) throw new EmailTakenException();
        if (userRepo.findByUserId(req.getUserId()).isPresent()) throw new UserIdTakenException();

        // 4) User 저장 (✅ 여기서 emailVerified=true로 확정 저장)
        User user = new User();
        user.setEmail(email);
        user.setUserId(req.getUserId());
        user.setUserName(req.getUserName());
        user.setEmailVerified(true); // <<< 핵심
        user.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : Instant.now());
        user.setUpdatedAt(Instant.now());
        user.setConsents(mapConsents(req.getConsents()));
        user = userRepo.save(user);

        // 5) Credentials 저장 (로그인용)
        LocalCredentials cred = new LocalCredentials();
        cred.setEmailForLogin(email); // 정규화된 이메일 사용
        cred.setUserId(req.getUserId());
        cred.setPwHash(encoder.encode(req.getUserPw()));
        cred.setUserRef(user.getId());
        try {
            credRepo.save(cred);
        } catch (DuplicateKeyException e) {
            // 자격 증명 중복이면 사용자 중복으로 취급
            throw new EmailTakenException();
        }

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

    private List<Consent> mapConsents(List<ConsentDTO> in) {
        if (in == null) return List.of();
        return in.stream().map(c -> {
            Consent cc = new Consent();
            cc.setType(ConsentType.valueOf(c.getType()));
            cc.setAgreed(c.isAgreed());
            cc.setAgreedAt(c.getAgreedAt() != null ? c.getAgreedAt() : Instant.now());
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
}
