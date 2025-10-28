package session.dto;

import session.domain.SessionStatus;

import java.time.Instant;
import java.util.List;

public record StudySessionDTO(
        String sessionId,
        String matchId,
        String menteeUserId,
        String mentorUserId,
        Instant startedAt,
        Instant endedAt,
        SessionStatus status,
        List<DistractionLogDTO> distractionLogs,
        List<StudyLogDTO> studyLogs,
        List<QuestionLogDTO> questionLogs
) {}