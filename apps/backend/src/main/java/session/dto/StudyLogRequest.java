package session.dto;

import jakarta.validation.constraints.NotBlank;

public record StudyLogRequest(
        @NotBlank(message = "학습 내용은 비워둘 수 없습니다.")
        String content
) {
}

