package board.domain;

import lombok.*;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardEntry {
    private String entryId;          // 각 질문의 고유 ID (UUID 등으로 생성)
    private String authorUserId;     // 작성자(멘티)의 userId
    private String questionNote;     // 멘티가 작성한 '질문 노트' 내용
    private Instant createdAt;       // 질문 작성 시각
    private BoardAnswer boardAnswer;
    private String title;

    // ✅ 1. '질문 번호' 필드 추가 (1부터 시작)
    private int entryNo;

    // ✅ 2. '완료 여부' 상태 필드 추가
    private EntryStatus status;
}
