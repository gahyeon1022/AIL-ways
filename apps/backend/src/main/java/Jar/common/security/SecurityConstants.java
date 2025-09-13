package Jar.common.security;

//OAuth 콜백 URl 처리하기 위해 해당 uRL 인증에 대한 인증 우회
public class SecurityConstants {
    public static final String[] allowUrls = {
            "/swagger-ui/**",
            "/swagger-resources/**",
            "/v3/api-docs/**",
            "/api/v1/posts/**",
            "/api/v1/replies/**",
            "/login",
            "/auth/login/kakao/**" //카카오 로그인 인증 우회
    };

}
