package session.dto;

import java.time.Instant;

public record QuestionLogDTO(
        String authorUserId,
        String question,
        Instant createdAt
) {}