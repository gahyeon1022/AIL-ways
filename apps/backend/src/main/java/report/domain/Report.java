package report.domain;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@Document("reports")
public class Report {
    @Id
    private String id;

    private String matchId;      // 어떤 멘토-멘티의 보고서인지 식별
    private String menteeUserId; // 보고서의 주체 (멘티)

    private String aiSummary;    // AI가 요약한 학습 내용

    private List<DistractionLog> distractionLogs; // '딴짓 로그' 목록
    private MentorFeedback mentorFeedback;        // 이 보고서에 대한 멘토의 최종 피드백

    private Instant createdAt;   // 학습 종료 및 보고서 생성 시각
}