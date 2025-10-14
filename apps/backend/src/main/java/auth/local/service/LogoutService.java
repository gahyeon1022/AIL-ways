package auth.local.service;

import common.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LogoutService {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    public void logout(String accessToken) {
        if (accessToken == null || !jwtUtil.validateToken(accessToken)) {
            // 유효하지 않은 토큰에 대한 요청은 무시하거나 예외 처리
            return;
        }

        // 1. 토큰의 남은 유효 시간 계산
        Long remainingTime = jwtUtil.getRemainingTime(accessToken); // (JwtUtil에 구현 필요)

        // 2. Redis에 (Key: "BLOCKED:" + 토큰, Value: "logout") 형태로 저장
        //    남은 유효 시간만큼만 Redis에 보관하여 메모리 낭비를 방지
        if (remainingTime > 0) {
            redisTemplate.opsForValue().set(
                    "BLOCKED:" + accessToken,
                    "logout",
                    remainingTime,
                    TimeUnit.MILLISECONDS
            );
        }
    }
}