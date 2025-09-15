package auth.local.service;

import auth.local.domain.Consent;
import auth.local.dto.ConsentDTO;
import auth.local.domain.ConsentType;
import auth.local.service.InvalidEmailDomainException;
import auth.local.domain.LocalCredentials;
import auth.local.service.WeakPasswordException;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;

import user.repository.UserRepository;
import user.domain.User;

import auth.local.repository.LocalCredentialsRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.List;

@Service
public class SignUpService {
    private final UserRepository userRepo;
    private final LocalCredentialsRepository credRepo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Value("${app.signup.blocked-domains}")
    private List<String> blockedDomains;

    public SignUpService(UserRepository userRepo, LocalCredentialsRepository credRepo) {
        this.userRepo = userRepo;
        this.credRepo = credRepo;
    }

    public SignUpResponse signUp(SignUpRequest req) {
        // 0) 이메일 도메인 차단 체크 (방어 코드 추가)
        String email = req.getEmail();
        int at = email == null ? -1 : email.indexOf('@');
        if (at <= 0 || at == email.length() - 1) {
            throw new InvalidEmailDomainException("올바르지 않은 이메일 형식");
        }
        String domain = email.substring(at + 1);
        if (blockedDomains != null && blockedDomains.stream()
                .map(String::toLowerCase).anyMatch(domain.toLowerCase()::equals)) {
            throw new InvalidEmailDomainException("해당 이메일 도메인은 자체 회원가입 불가: " + domain);
        }

        // 1) 비번 규칙 검사
        if (!isStrong(req.getUserPw())) throw new WeakPasswordException();

        // 2) 중복 체크
        if (userRepo.findByEmail(req.getEmail()).isPresent()) throw new EmailTakenException();
        if (userRepo.findByUserId(req.getUserId()).isPresent()) throw new UserIdTakenException();

        // 3) User 저장 (user.domain.User 사용)
        User user = new User();
        user.setEmail(req.getEmail());
        user.setUserId(req.getUserId());
        user.setUserName(req.getUserName());
        user.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : Instant.now());
        user.setConsents(mapConsents(req.getConsents())); // 타입 일치 필요
        user = userRepo.save(user);

        // 4) Credentials 저장
        LocalCredentials cred = new LocalCredentials();
        cred.setEmailForLogin(req.getEmail());
        cred.setUserId(req.getUserId());
        cred.setPwHash(encoder.encode(req.getUserPw()));
        cred.setUserRef(user.getId());
        try {
            credRepo.save(cred);
        } catch (DuplicateKeyException e) {
            throw new EmailTakenException();
        }

        // 5) 응답
        SignUpResponse res = new SignUpResponse();
        res.setEmail(user.getEmail());
        res.setUserId(user.getUserId());
        res.setUserName(user.getUserName());
        res.setCreatedAt(user.getCreatedAt());
        res.setConsents(req.getConsents());
        return res;
    }

    private boolean isStrong(String pw) { return pw != null && pw.length() >= 8; }

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
}
