package session.dto;

import java.time.Instant;

public record StudyLogDTO(
        String content,
        Instant timestamp
) {}