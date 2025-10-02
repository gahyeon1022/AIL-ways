package auth.social.kakao.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import user.domain.Provider;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KakaoService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return new DefaultOAuth2User(
                oAuth2User.getAuthorities(),
                oAuth2User.getAttributes(),
                "id" // application.yml의 user-name-attribute와 일치해야 함
        );
    }
    public User upsertUser(OAuth2User kakaoUser) {
        Map<String, Object> attrs = kakaoUser.getAttributes();

        // kakao 고유 ID
        String kakaoId = String.valueOf(attrs.get("id"));

        // kakaoAccount.email
        String email = null;
        Boolean emailVerified = null;
        Object accountObj = attrs.get("kakao_account");
        if (accountObj instanceof Map<?, ?> account) {
            Object em = account.get("email");
            if (em != null) email = String.valueOf(em);
            Object ev = account.get("is_email_verified");
            if (ev != null) emailVerified = Boolean.valueOf(String.valueOf(ev));
        }

        // properties.nickname
        String nickname = null;
        Object propsObj = attrs.get("properties");
        if (propsObj instanceof Map<?, ?> props) {
            Object nn = props.get("nickname");
            if (nn != null) nickname = String.valueOf(nn);
        }

        // 1) provider+providerUserId 로 조회 (소셜 고유키)
        Optional<User> found = userRepository.findByProviderAndProviderUserId(Provider.KAKAO, kakaoId);
        if (found.isPresent()) {
            User u = found.get();

            // 비어있을 때만 보수적으로 갱신
            if ((u.getEmail() == null || u.getEmail().isBlank()) && email != null) {
                u.setEmail(email);
            }
            if ((u.getUserName() == null || u.getUserName().isBlank()) && nickname != null) {
                u.setUserName(nickname);
            }
            if (emailVerified != null) {
                u.setEmailVerified(emailVerified);
            }
            u.setLastLoginAt(Instant.now());
            return userRepository.save(u);
        }

        // 2) 기존 로컬 계정과 이메일로 연결(선택: 원하면 유지/삭제)
        if (email != null) {
            Optional<User> byEmail = userRepository.findByEmail(email);
            if (byEmail.isPresent()) {
                User u = byEmail.get();
                // 로컬 계정에 소셜 메타만 붙여 연동
                u.setProvider(Provider.KAKAO);
                u.setProviderUserId(kakaoId);
                if ((u.getUserName() == null || u.getUserName().isBlank()) && nickname != null) {
                    u.setUserName(nickname);
                }
                if (emailVerified != null) u.setEmailVerified(emailVerified);
                u.setLastLoginAt(Instant.now());
                return userRepository.save(u);
            }
        }

        // 3) 신규 소셜 사용자 생성
        User newUser = User.builder()
                .provider(Provider.KAKAO)
                .providerUserId(kakaoId)
                .userId(kakaoId)
                .email(email)
                .userName(nickname)
                .role(null)                 // 기본 권한
                .emailVerified(Boolean.TRUE.equals(emailVerified))
                .lastLoginAt(Instant.now())
                .build();
        return userRepository.save(newUser);
    }
}