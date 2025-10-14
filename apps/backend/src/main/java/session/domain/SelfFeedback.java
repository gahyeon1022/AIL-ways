package session.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class SelfFeedback {
    private String comment;     // 멘티가 작성한 자기 피드백 내용 (예: "급한 연락이 옴")
    private Instant createdAt;  // 자기 피드백 작성 시각
}