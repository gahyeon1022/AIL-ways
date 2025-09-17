package common.config;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import auth.social.kakao.service.KakaoService;
import user.domain.User;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KakaoService kakaoService;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(o -> o
                        .userInfoEndpoint(u -> u.userService(kakaoService))
                        .successHandler((req, res, auth) -> {
                            OAuth2User oAuth2User = (OAuth2User) auth.getPrincipal();
                            User user = kakaoService.upsertUser(oAuth2User);

                            String jwt = "dummy.jwt.token.for." + user.getId();

                            Cookie cookie = new Cookie("ACCESS_TOKEN", jwt);
                            cookie.setHttpOnly(true);
                            cookie.setPath("/");
                            res.addCookie(cookie);

                            res.sendRedirect(req.getContextPath() + "/me"); //백-프론트 연동 전 임시 화면
//                            res.sendRedirect("/");
                        })
                        .failureHandler((req, res, ex) -> res.sendRedirect("/login?error"))
                );

        return http.build();
    }
}