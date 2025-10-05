package board.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document("boards")
public class Board {
    @Id
    private String id;

    @Indexed(unique = true)
    private String matchId;               // 매칭 하나당 게시판 하나

    @Indexed(unique = true)
    private String pairKey;               // mentorUserId::menteeId

    private String title;                 // "Mentor-Mentee Room" 등
    private List<String> memberUserIds;   // [mentorUserId, menteeUserId]
    private Instant createdAt;

    private List<BoardEntry> entries;


}
