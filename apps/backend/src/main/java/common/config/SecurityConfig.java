package common.config; //social + local integration



import auth.social.kakao.service.KakaoService;
import common.security.jwt.JwtAuthenticationFilter;
import common.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy; // [ADD]
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // [ADD]
import org.springframework.security.crypto.password.PasswordEncoder; // [ADD]
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KakaoService kakaoService; //
    private final JwtUtil jwtUtil;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean

    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(Customizer.withDefaults())
// OAuth2 state 저장을 위해 최소 IF_REQUIRED (STATLESS면 콜백 실패 뜰 수 있음)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth

                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll() //social
                                .requestMatchers("/swagger-ui/**","/v3/api-docs/**").permitAll() //swagger
                                .requestMatchers("/api/auth/**").permitAll() //local
                                .requestMatchers("/api/users/**").authenticated() //user
                                .requestMatchers("/api/matches/**").authenticated() //match
                                .requestMatchers("/api/boards/**").authenticated() //board
                                .requestMatchers("/api/sessions/**").authenticated() // session
                                .anyRequest().denyAll() // 화면은 3000이 담당, 허용된 경로 외 접근 금지
                )

// 인증 안 된 요청은 리다이렉트 말고 JSON 401로 (API 개발에 유리)

                .exceptionHandling(e -> e.authenticationEntryPoint((req,res,ex) -> {

                    res.setStatus(401);

                    res.setContentType("application/json;charset=UTF-8");

                    res.getWriter().write("{\"error\":\"unauthorized\"}");

               }))

                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> //카카오 로그인시, db저장 위함
                                // 🔑 KakaoService.loadUser() → upsertUser() 실행되도록 연결
                                userInfo.userService(kakaoService)
                        )
                        .successHandler((req,res,auth) -> {
                            DefaultOAuth2User oAuth2User = (DefaultOAuth2User) auth.getPrincipal();
                            //  DB에 저장/업데이트 보장
                            kakaoService.upsertUser(oAuth2User);
                            Map<String, Object> kakaoAccount = (Map<String, Object>) oAuth2User.getAttributes().get("kakao_account");
                            String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
                            String token = jwtUtil.generateToken(email);

                            res.sendRedirect("http://localhost:3000/select?token=" + token);
                        })
                )

                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);// 요청 헤더의 토큰 검증 수행

        return http.build();

    }

// [ADD] 공통 PasswordEncoder

    @Bean

    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }

}