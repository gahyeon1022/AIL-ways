package session.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudySessionDTO {
    private String id;
    private String matchId;
    private String menteeUserId;
    private String mentorUserId;
    private Instant startedAt;
    private Instant endedAt;
    private String status;
    private List<StudyLogDTO> studyLogs;
    private List<DistractionLogDTO> distractionLogs;
}