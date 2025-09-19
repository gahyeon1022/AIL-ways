// common.controller.MeController 백-프론트 연동 전 임시 로그인 성공화면
package common.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import user.domain.Provider;
import user.domain.User;
import user.repository.UserRepository;

import java.util.Map;
import java.util.Optional;

@RestController
public class MeController {

    private final UserRepository userRepository;

    public MeController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping(value = "/me", produces = MediaType.TEXT_HTML_VALUE)
    public String me(@AuthenticationPrincipal OAuth2User principal, HttpServletRequest req) {
        if (principal == null) {
            return """
                <html><body>
                <h3>로그인이 필요합니다</h3>
                <a href='%s/oauth2/authorization/kakao'>카카오로 로그인</a>
                </body></html>
                """.formatted(req.getContextPath());
        }

        Map<String, Object> attrs = principal.getAttributes();
        String kakaoId = String.valueOf(attrs.get("id"));

        String nickname = "-";
        Object propsObj = attrs.get("properties");
        if (propsObj instanceof Map<?, ?> props && props.get("nickname") != null) {
            nickname = String.valueOf(props.get("nickname"));
        }

        String email = "-";
        Object accountObj = attrs.get("kakao_account");
        if (accountObj instanceof Map<?, ?> account && account.get("email") != null) {
            email = String.valueOf(account.get("email"));
        }

        Optional<User> saved = userRepository.findByProviderAndProviderUserId(Provider.KAKAO, kakaoId);
        String userDocId = saved.map(User::getId).orElse("(미저장)");

        return """
            <html>
              <body style="font-family: system-ui; line-height:1.6; padding:24px;">
                <h2>로그인 성공 🎉</h2>
                <ul>
                  <li><b>카카오 ID</b>: %s</li>
                  <li><b>닉네임</b>: %s</li>
                  <li><b>이메일</b>: %s</li>
                  <li><b>DB User 문서 ID</b>: %s</li>
                </ul>
                <p>
                  <a href="%s/oauth2/authorization/kakao">다른 계정으로 로그인</a>
                </p>
              </body>
            </html>
            """.formatted(kakaoId, nickname, email, userDocId, req.getContextPath());
    }
}