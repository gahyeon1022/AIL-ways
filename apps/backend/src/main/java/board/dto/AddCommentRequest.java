package board.dto;

import jakarta.validation.constraints.NotBlank;

public record AddCommentRequest(
        @NotBlank(message = "댓글 내용은 비어 있을 수 없습니다.")
        String comment,
        String parentCommentId
) {}
