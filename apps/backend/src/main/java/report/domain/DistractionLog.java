package report.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class DistractionLog {
    private Instant detectedAt;   // 딴짓이 감지된 시각 (예: "2025-09-22T23:34:34Z")
    private String activity;      // 감지된 딴짓 내용 (예: "휴대폰 봄")
    private SelfFeedback selfFeedback; // 멘티의 자기 피드백
}
