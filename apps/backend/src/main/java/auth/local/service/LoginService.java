package auth.local.service;

import auth.local.domain.LocalCredentials;
import auth.local.repository.LocalCredentialsRepository;
import user.domain.User;
import user.repository.UserRepository;
import auth.local.dto.LoginRequest;
import auth.local.dto.LoginResponse;
import common.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final LocalCredentialsRepository credRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByUserId(req.userId())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 계정입니다."));


        // 비밀번호를 비교합니다.
        LocalCredentials cred = credRepo.findByUserId(req.userId())
                .orElseThrow(() -> new RuntimeException("자격 증명 없음"));

        if (!passwordEncoder.matches(req.userPw(), cred.getPwHash())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰을 생성합니다.
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, "Bearer");
    }
}
