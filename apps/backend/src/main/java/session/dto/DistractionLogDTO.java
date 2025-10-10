package session.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistractionLogDTO {
    private String activity;
    private Instant detectedAt;
}