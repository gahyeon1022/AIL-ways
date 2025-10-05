package board.dto;

import jakarta.validation.constraints.NotBlank;

public record AddEntryRequest(
        @NotBlank String title,
        @NotBlank String questionNote
) {}