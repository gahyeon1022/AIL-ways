package session.dto;

import java.time.Instant;
import java.util.List;

public record StudySessionDTO(
        String sessionId,
        String matchId,
        String menteeUserId,
        String mentorUserId,
        Instant startedAt,
        Instant endedAt,
        String status,
        List<DistractionLogDTO> distractionLogs,
        List<StudyLogDTO> studyLogs,
        List<QuestionLogDTO> questionLogs
) {}