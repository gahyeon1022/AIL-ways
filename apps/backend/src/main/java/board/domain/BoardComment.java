package board.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardComment {
    private String commentId;
    private String authorUserId;
    private String content;
    private Instant createdAt;

    @Builder.Default
    private List<BoardComment> replies = new ArrayList<>();
}
