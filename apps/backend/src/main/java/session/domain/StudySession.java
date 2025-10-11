package session.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("study_sessions")
public class StudySession {
    @Id
    private String sessionId;

    private String matchId;       // 어떤 매칭(멘토-멘티 세션)인지
    private String menteeUserId;
    private String mentorUserId;

    private Instant startedAt;
    private Instant endedAt;
    private String status; // ACTIVE, ENDED

    @Builder.Default
    private List<StudyLog> studyLogs = new ArrayList<>();

    @Builder.Default
    private List<DistractionLog> distractionLogs = new ArrayList<>();

    @Builder.Default
    private List<QuestionLog> questionLogs = new ArrayList<>();
}