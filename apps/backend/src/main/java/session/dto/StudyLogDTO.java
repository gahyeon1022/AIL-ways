package session.dto;

import java.time.Instant;

public record StudyLogDTO(
        String authorUserId,
        String content,
        Instant timestamp
) {}