package auth.local.service;

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
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest req) {
        // userId를 이메일로 간주하고 데이터베이스에서 사용자를 찾습니다.
        User user = userRepository.findByEmail(req.userId()) // <<< 여기를 req.userId()로 변경
                .orElseThrow(() -> new RuntimeException("존재하지 않는 계정입니다."));

        // 비밀번호를 비교합니다.
        if (!passwordEncoder.matches(req.userPw(), user.getPassword())) { // <<< 여기를 req.userPw()로 변경
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // JWT 토큰을 생성합니다.
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, "Bearer");
    }
}
