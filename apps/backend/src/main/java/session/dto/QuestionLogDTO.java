package session.dto;

import java.time.Instant;

public record QuestionLogDTO(
        String question,
        Instant createdAt
) {}