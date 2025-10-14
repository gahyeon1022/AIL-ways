package common.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate; // ✨ 2. RedisTemplate 필드 추가 (생성자 주입)

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        // ✨ 3. 핵심 수정: 블랙리스트 확인 로직 추가
        if (token != null) {
            // Redis에서 해당 토큰이 로그아웃 처리되었는지 확인
            String isBlocked = redisTemplate.opsForValue().get("BLOCKED:" + token);

            // 토큰이 블랙리스트에 없고(isBlocked == null) 유효할 경우에만 인증 절차 진행
            if (isBlocked == null && jwtUtil.validateToken(token)) {
                String userId = jwtUtil.getUserId(token);
                Optional<User> userOptional = userRepository.findByUserId(userId);

                if (userOptional.isPresent()) {
                    User user = userOptional.get();
                    Role role = user.getRole();

                    List<GrantedAuthority> authorities;
                    if (role != null) {
                        authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
                    } else {
                        authorities = Collections.emptyList();
                    }

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}