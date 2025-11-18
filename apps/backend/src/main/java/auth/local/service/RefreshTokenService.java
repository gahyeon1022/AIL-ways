package auth.local.service;

import common.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String KEY_PREFIX = "REFRESH:";

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    public void storeRefreshToken(String refreshToken, String userId) {
        if (!StringUtils.hasText(refreshToken) || !StringUtils.hasText(userId)) {
            return;
        }
        Long ttl = jwtUtil.getRemainingTime(refreshToken);
        if (ttl == null || ttl <= 0) {
            return;
        }
        redisTemplate.opsForValue().set(
                KEY_PREFIX + refreshToken,
                userId,
                ttl,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isRefreshTokenValid(String refreshToken, String userId) {
        if (!StringUtils.hasText(refreshToken) || !StringUtils.hasText(userId)) {
            return false;
        }
        String stored = redisTemplate.opsForValue().get(KEY_PREFIX + refreshToken);
        return stored != null && stored.equals(userId);
    }

    public void revokeRefreshToken(String refreshToken) {
        if (!StringUtils.hasText(refreshToken)) {
            return;
        }
        redisTemplate.delete(KEY_PREFIX + refreshToken);
    }
}
