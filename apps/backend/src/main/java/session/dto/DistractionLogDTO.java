package session.dto;

import java.time.Instant;

public record DistractionLogDTO(
        String activity,
        Instant detectedAt,
        SelfFeedbackDTO selfFeedback
) {}