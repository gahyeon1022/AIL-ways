package board.service;

import board.domain.Board;
import board.domain.BoardComment;
import board.domain.BoardEntry;
import board.domain.EntryStatus;
import board.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;

    @Transactional
    public Board addEntryToBoard(String boardId, String authorUserId, String title, String questionNote) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(authorUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        // 새로운 질문 번호 계산
        int newEntryNo = (board.getEntries() == null) ? 1 : board.getEntries().size() + 1;

        BoardEntry newEntry = BoardEntry.builder()
                .entryId(UUID.randomUUID().toString())
                .authorUserId(authorUserId)
                .title(title)
                .questionNote(questionNote)
                .createdAt(Instant.now())
                .entryNo(newEntryNo) // 질문 번호 설정
                .status(EntryStatus.INCOMPLETE) // 상태를 '미완료'로 초기화
                .build();

        if (board.getEntries() == null) {
            board.setEntries(new ArrayList<>());
        }
        board.getEntries().add(newEntry);

        return boardRepository.save(board);
    }

    @Transactional
    public Board addCommentToEntry(String boardId, String entryId, String authorUserId, String comment, String parentCommentId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(authorUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry entry = board.getEntries().stream()
                .filter(e -> e.getEntryId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        if (entry.getStatus() == EntryStatus.COMPLETED) {
            throw new IllegalStateException("This entry is already completed and cannot receive more comments.");
        }

        if (entry.getComments() == null) {
            entry.setComments(new ArrayList<>());
        }

        BoardComment newComment = BoardComment.builder()
                .commentId(UUID.randomUUID().toString())
                .authorUserId(authorUserId)
                .content(comment)
                .createdAt(Instant.now())
                .build();

        if (parentCommentId == null || parentCommentId.isBlank()) {
            entry.getComments().add(newComment);
        } else {
            BoardComment parent = findComment(entry.getComments(), parentCommentId);
            if (parent == null) {
                throw new IllegalArgumentException("Comment not found: " + parentCommentId);
            }
            parent.getReplies().add(newComment);
        }

        return boardRepository.save(board);
    }

    @Transactional(readOnly = true)
    public Board getBoard(String boardId, String actingUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You do not have permission to view this board.");
        }

        return board;
    }

    /**
     * 두 사용자의 userId를 이용하여 Board를 조회합니다.
     * 이 메서드에서 findByPairKey가 사용됩니다.
     */
    @Transactional(readOnly = true)
    public Board getBoardByUserIds(String userId1, String userId2, String actingUserId) {
        // 요청자가 해당 게시판의 멤버인지 권한 확인
        if (!actingUserId.equals(userId1) && !actingUserId.equals(userId2)) {
            throw new IllegalStateException("You do not have permission to view this board.");
        }

        // MatchService와 동일한 로직으로 항상 같은 pairKey를 생성
        String id1 = userId1;
        String id2 = userId2;
        if (id1.compareTo(id2) > 0) {
            String temp = id1;
            id1 = id2;
            id2 = temp;
        }
        String pairKey = id1 + "::" + id2;

        return boardRepository.findByPairKey(pairKey)
                .orElseThrow(() -> new IllegalArgumentException("Board not found for the given users."));
    }

    @Transactional
    public Board completeEntry(String boardId, String entryId, String actingUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry entry = board.getEntries().stream()
                .filter(e -> e.getEntryId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        if (!entry.getAuthorUserId().equals(actingUserId)) {
            throw new IllegalStateException("Only the mentee who created this entry can complete it.");
        }

        entry.setStatus(EntryStatus.COMPLETED);
        return boardRepository.save(board);
    }

    private BoardComment findComment(Iterable<BoardComment> comments, String commentId) {
        if (comments == null) {
            return null;
        }
        for (BoardComment comment : comments) {
            if (comment.getCommentId().equals(commentId)) {
                return comment;
            }
            BoardComment nested = findComment(comment.getReplies(), commentId);
            if (nested != null) {
                return nested;
            }
        }
        return null;
    }
}
