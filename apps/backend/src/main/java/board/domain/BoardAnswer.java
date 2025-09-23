package board.domain;

import lombok.*;


import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardAnswer {
    private String authorUserId; // 피드백 작성자(멘토)의 userId
    private String comment;      // 멘토가 작성한 답변/댓글 내용
    private Instant createdAt;   // 피드백 작성 시각
}