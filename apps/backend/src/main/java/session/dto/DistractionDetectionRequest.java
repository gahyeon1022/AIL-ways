package session.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * AI 클라이언트로부터 딴짓 감지 신호를 받기 위한 DTO
 */
public record DistractionDetectionRequest(
        @NotBlank(message = "감지된 활동 내용은 비어 있을 수 없습니다.")
        String activity, // 예: "스마트폰 사용", "자리 이탈"

        String detectionType // 예: "VISION_AI", "SOUND_AI" (확장성을 위해 추가)
) {}