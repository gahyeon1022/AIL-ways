package board.dto;

import jakarta.validation.constraints.NotBlank;

public record AddAnswerRequest(
        @NotBlank String comment
) {}