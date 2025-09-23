package report.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class MentorFeedback {
    private String mentorUserId; // 피드백을 남긴 멘토
    private String comment;      // 피드백 내용
    private Instant createdAt;   // 피드백 작성 시각
}