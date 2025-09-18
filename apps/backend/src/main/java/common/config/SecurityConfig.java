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
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)) // ⬅️ OAuth2 state 저장
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",                           // 루트 허용
                                "/**.html",                  // 정적 테스트 html 허용(있다면)
                                "/api/auth/**",
                                "/oauth2/**", "/login/oauth2/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(o -> o
                        .successHandler((req,res,auth) -> res.sendRedirect("/me"))   // 프론트 없이 확인용
                        .failureHandler((req,res,ex) -> {
                            res.setStatus(401);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"error\":\""+ex.getMessage()+"\"}");
                        })
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable);
                // [ADD - 선택] 소셜 성공 시 JWT 발급/리다이렉트 연결 지점
                // .oauth2Login(oauth -> oauth
                //     .userInfoEndpoint(ue -> ue.userService(kakaoService))
                //     .successHandler((req, res, auth) -> {
                //         // String jwt = jwtTokenProvider.createAccessToken(...);
                //         // res.addHeader("Authorization","Bearer " + jwt);
                //     })
                // )
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