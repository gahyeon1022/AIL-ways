package session.dto;

import java.time.Instant;

public record DistractionLogDTO(
        String activity,
        String detectionType,
        Instant detectedAt,
        SelfFeedbackDTO selfFeedback
) {}
