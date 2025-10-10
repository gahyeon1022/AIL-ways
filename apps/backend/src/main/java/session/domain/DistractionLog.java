package session.domain;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistractionLog {
    private String activity;    // 휴대폰 사용, 잡담 등
    private Instant detectedAt;
}