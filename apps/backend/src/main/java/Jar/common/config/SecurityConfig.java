package Jar.common.config;

import Jar.common.security.SecurityConstants;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain security(HttpSecurity http) throws Exception {
        http
                // API 서버 기본값: CSRF/폼로그인/HTTP Basic 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // URL 인가 정책
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(SecurityConstants.allowUrls).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}