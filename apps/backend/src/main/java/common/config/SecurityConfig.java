package common.config; //social + local integration



import auth.social.kakao.service.KakaoService;
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

//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // [ADD - JWT 필터 쓸 때]



@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final KakaoService kakaoService; // [ADD - 소셜 성공 처리 연결 시]
// private final JwtTokenProvider jwtTokenProvider; // [ADD - JWT 사용 시]
    private final JwtUtil jwtUtil;


    @Bean

    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(Customizer.withDefaults())
// OAuth2 state 저장을 위해 최소 IF_REQUIRED (STATLESS면 콜백 실패 뜰 수 있음)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth

                                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                                .requestMatchers("/api/auth/**").permitAll() // 회원가입/로그인
                                .requestMatchers("/actuator/health").permitAll() //이거 뭐에요?
                                .requestMatchers("/api/**").authenticated() // 그 외 API는 인증 필요
                                .requestMatchers("/api/user/**").authenticated()
                                .requestMatchers("/swagger-ui/**","/v3/api-docs/**").permitAll() //swagger문서 확인용
                                .requestMatchers("/users/**").permitAll()  // ✅ 공개
                                .anyRequest().denyAll() // 화면은 3000이 담당

// .anyRequest().authenticated()

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
                            String kakaoId = String.valueOf(oAuth2User.getAttributes().get("id"));
                            String token = jwtUtil.generateToken(kakaoId);

                            res.sendRedirect("http://localhost:3000/select?token=" + token);
                        })
                )

                .formLogin(AbstractHttpConfigurer::disable)

                .httpBasic(AbstractHttpConfigurer::disable);

        return http.build();

    }

// [ADD] 공통 PasswordEncoder

    @Bean

    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }

}