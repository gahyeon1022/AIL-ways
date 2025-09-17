package common.config; //social + local integration

import auth.social.kakao.service.KakaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;  // [ADD]
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // [ADD]
import org.springframework.security.crypto.password.PasswordEncoder;      // [ADD]
import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // [ADD - JWT 필터 쓸 때]

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

     private final KakaoService kakaoService;     // [ADD - 소셜 성공 처리 연결 시]
    // private final JwtTokenProvider jwtTokenProvider; // [ADD - JWT 사용 시]

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)                 // [KEEP]
                .cors(Customizer.withDefaults())                       // [ADD] CORS 기본
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // [ADD] JWT 전제: 세션 미사용
                )

                .authorizeHttpRequests(auth -> auth
                        // [KEEP/MOD] 공개해도 되는 최소 경로만 허용
                        .requestMatchers(
                                "/api/auth/**",              // 로컬 로그인/회원가입/재발급 등
                                "/oauth2/**", "/login/oauth2/**" // 소셜 콜백
                        ).permitAll()

                        // [ADD] API 문서(선택). 운영에선 꺼도 됨
                        .requestMatchers("/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html").permitAll()

                        // [ADD] CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // [MOD] 나머지는 인증 필요
                        .anyRequest().authenticated()
                )

                // [ADD - 선택] 소셜 성공 시 JWT 발급/리다이렉트 연결 지점
                // .oauth2Login(oauth -> oauth
                //     .userInfoEndpoint(ue -> ue.userService(kakaoService))
                //     .successHandler((req, res, auth) -> {
                //         // String jwt = jwtTokenProvider.createAccessToken(...);
                //         // res.addHeader("Authorization","Bearer " + jwt);
                //     })
                // )

                // [ADD] 폼 로그인/HTTP Basic 비활성 (REST만 사용)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);

        // [ADD - 선택] JWT 필터가 있다면 위치 고정
        // http.addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
        //         UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // [ADD] 공통 PasswordEncoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}