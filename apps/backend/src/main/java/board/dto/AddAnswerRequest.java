package board.dto;

import jakarta.validation.constraints.NotBlank;

public record AddAnswerRequest(
        String authorUserId,
        @NotBlank String comment
) {}