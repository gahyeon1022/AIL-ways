package board.dto;

import jakarta.validation.constraints.NotBlank;

public record AddEntryRequest(
        String authorUserId,
        @NotBlank String title,
        @NotBlank String questionNote
) {}