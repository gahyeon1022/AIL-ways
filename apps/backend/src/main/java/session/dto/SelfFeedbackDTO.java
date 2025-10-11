package session.dto;

import java.time.Instant;

public record SelfFeedbackDTO(
        String comment,
        Instant createdAt
) {}