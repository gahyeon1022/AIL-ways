package common.security.oauth;

import common.security.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    //카카오 소셜로그인 성공시를 다루기 위한 핸들러

    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();

        // 카카오 고유 id를 subject로 JWT 발급
        String token = jwtUtil.generateToken(String.valueOf(oAuth2User.getAttributes().get("id")));

        // 프론트로 redirect
        String redirectUrl = "http://localhost:3000/select?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}