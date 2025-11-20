package common.config;

import auth.local.service.RefreshTokenService;
import auth.social.kakao.service.KakaoService;
import common.security.jwt.JwtAuthenticationFilter;
import common.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KakaoService kakaoService;
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)

                // OAuth2 로그인 state용 - IF_REQUIRED 유지
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth

                        // ⬇⬇⬇ 반드시 추가해야 하는 부분! (403 원인 해결)
                        .requestMatchers("/error").permitAll()
                        // ⬆⬆⬆

                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // 인증 필요
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/matches/**").authenticated()
                        .requestMatchers("/api/boards/**").authenticated()
                        .requestMatchers("/api/sessions/**").authenticated()
                        .requestMatchers("/api/reports/**").authenticated()

                        .anyRequest().denyAll()
                )

                .exceptionHandling(e ->
                        e.authenticationEntryPoint((req, res, ex) -> {
                            res.setStatus(401);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"error\":\"unauthorized\"}");
                        })
                )

                .oauth2Login(oauth ->
                        oauth.userInfoEndpoint(userInfo ->
                                        userInfo.userService(kakaoService))
                                .successHandler((req, res, auth) -> {

                                    DefaultOAuth2User oAuth2User = (DefaultOAuth2User) auth.getPrincipal();

                                    boolean isNewUser = kakaoService.upsertUser(oAuth2User);

                                    Map<String, Object> attributes = oAuth2User.getAttributes();
                                    Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
                                    String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;

                                    String accessToken = jwtUtil.generateToken(email);
                                    String refreshToken = jwtUtil.generateRefreshToken(email);

                                    refreshTokenService.storeRefreshToken(refreshToken, email);

                                    Long refreshTtl = jwtUtil.getRemainingTime(refreshToken);
                                    long refreshExpiresIn = refreshTtl != null && refreshTtl > 0
                                            ? TimeUnit.MILLISECONDS.toSeconds(refreshTtl)
                                            : 0L;

                                    String redirectBase = isNewUser
                                            ? frontendUrl + "/terms-consents"
                                            : frontendUrl + "/home";

                                    String redirectUrl = UriComponentsBuilder.fromHttpUrl(redirectBase)
                                            .queryParam("token", accessToken)
                                            .queryParam("refreshToken", refreshToken)
                                            .queryParam("refreshTokenExpiresIn", refreshExpiresIn)
                                            .build()
                                            .toUriString();

                                    res.sendRedirect(redirectUrl);
                                })
                )

                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

        // JWT 필터 추가
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
