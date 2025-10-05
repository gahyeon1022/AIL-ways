package common.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor // 생성자 주입을 위해 @RequiredArgsConstructor 사용
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtUtil.validateToken(token)) {
            String userId = jwtUtil.getUserId(token);
            Optional<User> userOptional = userRepository.findByUserId(userId);

            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Role role = user.getRole();

                // ✅ 핵심 수정 부분: role이 null일 경우를 안전하게 처리
                List<GrantedAuthority> authorities;
                if (role != null) {
                    // 역할이 있으면 해당 역할을 권한으로 추가
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
                } else {
                    // 역할이 아직 지정되지 않았으면 (null이면) 권한 목록을 비워둠
                    authorities = Collections.emptyList();
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(userId, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
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
