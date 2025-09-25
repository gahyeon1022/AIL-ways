package auth.local.dto;

import jakarta.validation.constraints.NotBlank;

// record를 사용하면 getter, 생성자 등을 자동으로 만들어줍니다.
// 프론트에서 보내는 JSON key와 이름이 정확히 일치해야 합니다.
public record LoginRequest(
        @NotBlank String userId,
        @NotBlank String userPw
) {}
