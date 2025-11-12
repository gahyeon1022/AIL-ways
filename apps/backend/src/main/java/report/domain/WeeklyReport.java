package report.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("weekly_reports")
public class WeeklyReport {

    @Id
    private String id;

    private String matchId;
    private String mentorUserId;
    private String menteeUserId;

    private Instant weekStart;
    private Instant weekEnd;

    private Map<String, Double> studyHours;
    private double totalHours;
    private int focusMe;
    private int focusAvg;

    private String aiSummary;
    private Instant generatedAt;
}
