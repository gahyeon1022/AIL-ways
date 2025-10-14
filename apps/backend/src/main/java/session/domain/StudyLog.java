package session.domain;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyLog {
    private String content;
    private Instant timestamp;
}