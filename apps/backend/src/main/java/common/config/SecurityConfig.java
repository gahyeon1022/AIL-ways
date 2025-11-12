package common.config; // social + local integration

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

import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KakaoService kakaoService;
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // ✅ 프론트엔드 URL 환경변수로 분기 (기본값: 로컬)
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                // OAuth2 state 저장을 위해 최소 IF_REQUIRED (STATLESS면 콜백 실패 뜰 수 있음)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()   // 카카오 인증 콜백
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger
                        .requestMatchers("/api/auth/**").permitAll() // 로컬 로그인/회원가입
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/matches/**").authenticated()
                        .requestMatchers("/api/boards/**").authenticated()
                        .requestMatchers("/api/sessions/**").authenticated()
                        .anyRequest().denyAll() // 프론트가 화면 담당
                )

                // 인증되지 않은 요청은 JSON 401 응답으로 반환
                .exceptionHandling(e -> e.authenticationEntryPoint((req, res, ex) -> {
                    res.setStatus(401);
                    res.setContentType("application/json;charset=UTF-8");
                    res.getWriter().write("{\"error\":\"unauthorized\"}");
                }))

                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo ->
                                // 🔑 KakaoService.loadUser() → upsertUser() 실행되도록 연결
                                userInfo.userService(kakaoService)
                        )
                        .successHandler((req, res, auth) -> {
                            DefaultOAuth2User oAuth2User = (DefaultOAuth2User) auth.getPrincipal();

                            // ✅ 신규 유저 여부 확인
                            boolean isNewUser = kakaoService.upsertUser(oAuth2User);

                            // ✅ 이메일 추출
                            Map<String, Object> kakaoAccount =
                                    (Map<String, Object>) oAuth2User.getAttributes().get("kakao_account");
                            String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;

                            // ✅ JWT 생성
                            String token = jwtUtil.generateToken(email);

                            // ✅ 환경에 따라 프론트엔드 주소 자동 선택
                            if (isNewUser) {
                                res.sendRedirect(frontendUrl + "/terms-consents?token=" + token);
                            } else {
                                res.sendRedirect(frontendUrl + "/home?token=" + token);
                            }
                        })
                        .failureHandler((req, res, ex) -> {
                            // 로그인 실패 시 프론트 에러 페이지로 리다이렉트
                            res.sendRedirect(frontendUrl + "/login/error");
                        })
                )

                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

        // JWT 필터 추가 (요청 헤더의 토큰 검증)
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // [ADD] 공통 PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
