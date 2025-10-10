package session.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyLogDTO {
    private String authorUserId;
    private String content;
    private Instant timestamp;
}