package auth.local.service;

import auth.local.domain.Consent;
import auth.local.domain.ConsentType;
import auth.local.domain.LocalCredentials;
import auth.local.dto.ConsentDTO;
import auth.local.dto.SignUpRequest;
import auth.local.dto.SignUpResponse;
import auth.local.exception.*;
import auth.local.repository.LocalCredentialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import user.domain.User;
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
        // 0) 이메일 형식/도메인 체크
        String email = req.getEmail();
        int at = (email == null) ? -1 : email.indexOf('@');
        if (at <= 0 || at == email.length() - 1) {
            throw new InvalidEmailDomainException("올바르지 않은 이메일 형식");
        }


        // 새 구조 (코드 직접 확인)
        if (!emailVerService.verifyCode(req.getEmail(), req.getCode())) {
            throw new IllegalStateException("이메일 인증 실패: 코드가 올바르지 않음");
        }


        // 1) 비밀번호 규칙
        if (!isStrong(req.getUserPw())) throw new WeakPasswordException();

        // 2) 중복 체크
        if (userRepo.findByEmail(req.getEmail()).isPresent()) throw new EmailTakenException();
        if (userRepo.findByUserId(req.getUserId()).isPresent()) throw new UserIdTakenException();

        // 3) User 저장
        User user = new User();
        user.setEmail(req.getEmail());
        user.setUserId(req.getUserId());
        user.setUserName(req.getUserName());
        user.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : Instant.now());
        user.setConsents(mapConsents(req.getConsents()));
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
