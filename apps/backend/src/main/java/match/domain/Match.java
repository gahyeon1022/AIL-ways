package match.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document("matches")
public class Match {
    @Id
    private String matchId; // id-> matchId로 수정

    @Indexed
    private String mentorUserId;   // User.userId

    @Indexed
    private String menteeUserId;   // User.userId

    @Indexed(unique = true)
    private String pairKey;        // mentorUserId + "::" + menteeUserId

    private MatchStatus status;    // PENDING, ACCEPTED, REJECTED
    private Instant createdAt;
    private Instant updatedAt;
}
