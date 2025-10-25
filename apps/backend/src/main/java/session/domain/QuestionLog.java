package session.domain;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionLog {
    private String question;     // 질문 내용
    private Instant createdAt;   // 작성 시각
}