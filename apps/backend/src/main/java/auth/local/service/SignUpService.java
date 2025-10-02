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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import user.domain.Consent;
import user.domain.Provider;
import user.domain.User;
import user.dto.ConsentDTO;
import user.repository.UserRepository;
import java.time.ZonedDateTime; //한국 서버 현재 시간 사용위해 필요함
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

        // 2) 이메일 인증 코드 검증 (성공 시점에 코드 used=true 처리)
        boolean verified = emailVerService.verifyCode(email, req.getCode());
        if (!verified) throw new IllegalStateException("이메일 인증 실패");

        // 3) 중복 체크 (정규화된 이메일/아이디로)
        if (userRepo.findByEmail(email).isPresent()) throw new EmailTakenException();
        if (userRepo.findByUserId(req.getUserId()).isPresent()) throw new UserIdTakenException();

        // 현재 시각 (KST → Instant 변환)
        Instant now = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toInstant();

        // 4) User 저장 (✅ 여기서 emailVerified=true로 확정 저장)
        User user = new User();
        user.setEmail(email);
        user.setUserId(req.getUserId());
        user.setUserName(req.getUserName());
        user.setProvider(Provider.LOCAL); //로컬회원가입 전용 로직 -> Provider = LOCAL로 지정 및 저장
        user.setEmailVerified(true); // <<< 핵심
        user.setCreatedAt(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toInstant()); // 한국 서버 시간 적용
        user.setUpdatedAt(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toInstant()); // 한국 서버 시간 적용
        user.setConsents(mapConsents(req.getConsents(), now));
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
        return pw.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$"); //대문자+소문자+숫자+8자이상+특수기호
    }

    // now 인자를 넘겨주어 createdAt/updatedAt과 동일한 기준 시간 사용
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
}
