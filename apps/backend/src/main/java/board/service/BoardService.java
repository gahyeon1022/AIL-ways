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
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
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
        String normalizedTitle = stripWrappingBrackets(title);

        BoardEntry newEntry = BoardEntry.builder()
                .entryId(UUID.randomUUID().toString())
                .authorUserId(authorUserId)
                .title(normalizedTitle)
                .questionNote(questionNote)
                .createdAt(Instant.now())
                .entryNo(newEntryNo) // 질문 번호 설정
                .status(EntryStatus.INCOMPLETE) // 상태를 '미완료'로 초기화
                .build();

        if (board.getEntries() == null) {
            board.setEntries(new ArrayList<>());
        }
        board.getEntries().add(newEntry);

        return sanitizeBoard(boardRepository.save(board));
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

        return sanitizeBoard(boardRepository.save(board));
    }

    @Transactional
    public Board updateCommentOnEntry(String boardId, String entryId, String commentId, String actingUserId, String updatedContent) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry entry = board.getEntries().stream()
                .filter(e -> e.getEntryId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        if (entry.getComments() == null || entry.getComments().isEmpty()) {
            throw new IllegalArgumentException("No comments exist for this entry.");
        }

        BoardComment target = findComment(entry.getComments(), commentId);
        if (target == null) {
            throw new IllegalArgumentException("Comment not found: " + commentId);
        }
        if (!actingUserId.equals(target.getAuthorUserId())) {
            throw new IllegalStateException("You can only edit your own comment.");
        }

        target.setContent(updatedContent);
        return sanitizeBoard(boardRepository.save(board));
    }

    @Transactional
    public Board deleteCommentFromEntry(String boardId, String entryId, String commentId, String actingUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry entry = board.getEntries().stream()
                .filter(e -> e.getEntryId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        if (entry.getComments() == null || entry.getComments().isEmpty()) {
            throw new IllegalArgumentException("No comments exist for this entry.");
        }

        boolean removed = removeComment(entry.getComments(), commentId, actingUserId);
        if (!removed) {
            throw new IllegalArgumentException("Comment not found: " + commentId);
        }

        return sanitizeBoard(boardRepository.save(board));
    }

    @Transactional(readOnly = true)
    public Board getBoard(String boardId, String actingUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You do not have permission to view this board.");
        }

        return sanitizeBoard(board);
    }

    /**
     * 두 사용자의 userId를 이용하여 Board를 조회합니다.
     * 이 메서드에서 findByPairKey가 사용됩니다.
     */
    @Transactional(readOnly = true)
    public Board getBoardByUserIds(String userId1, String userId2, String actingUserId, int page, int size) {
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

        Board board = boardRepository.findByPairKey(pairKey)
                .orElseThrow(() -> new IllegalArgumentException("Board not found for the given users."));
        Board sanitized = sanitizeBoard(board);
        sanitized.setEntries(paginateEntries(sanitized.getEntries(), page, size));
        return sanitized;
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
        return sanitizeBoard(boardRepository.save(board));
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

    private boolean removeComment(List<BoardComment> comments, String commentId, String actingUserId) {
        if (comments == null) {
            return false;
        }
        Iterator<BoardComment> iterator = comments.iterator();
        while (iterator.hasNext()) {
            BoardComment comment = iterator.next();
            if (comment.getCommentId().equals(commentId)) {
                if (!actingUserId.equals(comment.getAuthorUserId())) {
                    throw new IllegalStateException("You can only delete your own comment.");
                }
                iterator.remove();
                return true;
            }
            if (removeComment(comment.getReplies(), commentId, actingUserId)) {
                return true;
            }
        }
        return false;
    }

    private Board sanitizeBoard(Board board) {
        if (board == null) {
            return null;
        }
        board.setTitle(stripWrappingBrackets(board.getTitle()));
        if (board.getEntries() != null) {
            board.getEntries().forEach(entry -> entry.setTitle(stripWrappingBrackets(entry.getTitle())));
        }
        return board;
    }

    private List<BoardEntry> paginateEntries(List<BoardEntry> entries, int page, int size) {
        if (entries == null || entries.isEmpty()) {
            return Collections.emptyList();
        }
        int safeSize = size > 0 ? size : DEFAULT_PAGE_SIZE;
        int safePage = Math.max(page, 0);
        int fromIndex = safePage * safeSize;
        if (fromIndex >= entries.size()) {
            return Collections.emptyList();
        }
        int toIndex = Math.min(entries.size(), fromIndex + safeSize);
        return new ArrayList<>(entries.subList(fromIndex, toIndex));
    }

    private static final int DEFAULT_PAGE_SIZE = 10;

    private String stripWrappingBrackets(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim();
        if (trimmed.length() >= 2 && trimmed.startsWith("[") && trimmed.endsWith("]")) {
            String unwrapped = trimmed.substring(1, trimmed.length() - 1).trim();
            if (!unwrapped.isEmpty()) {
                return unwrapped;
            }
        }
        return trimmed;
    }
}
