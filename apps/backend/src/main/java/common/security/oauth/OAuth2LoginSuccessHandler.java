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
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    //카카오 소셜로그인 성공시를 다루기 위한 핸들러

    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();

        String email = ((Map<String, Object>) oAuth2User.getAttributes().get("kakao_account")).get("email").toString();
        String token = jwtUtil.generateToken(email);
        // 프론트로 redirect
        String redirectUrl = "http://localhost:3000/select?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}