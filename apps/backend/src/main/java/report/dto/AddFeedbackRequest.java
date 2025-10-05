package report.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 멘토 또는 멘티의 피드백 요청을 처리하기 위한 DTO
 */
public record AddFeedbackRequest(
        @NotBlank(message = "피드백 내용은 비어 있을 수 없습니다.")
        String comment
) {}

