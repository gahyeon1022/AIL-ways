package board.service;

import board.domain.Board;
import board.domain.BoardAnswer;
import board.domain.BoardEntry;
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
    // ✅ 1. 메서드 파라미터에 'title' 추가
    public Board addEntryToBoard(String boardId, String authorUserId, String title, String questionNote) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(authorUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry newEntry = BoardEntry.builder()
                .entryId(UUID.randomUUID().toString())
                .authorUserId(authorUserId)
                .title(title)
                .questionNote(questionNote)
                .createdAt(Instant.now())
                .build();

        if (board.getEntries() == null) {
            board.setEntries(new ArrayList<>());
        }
        board.getEntries().add(newEntry);

        return boardRepository.save(board);
    }

    @Transactional
    public Board addAnswerToEntry(String boardId, String entryId, String authorUserId, String comment) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(authorUserId)) {
            throw new IllegalStateException("You are not a member of this board.");
        }

        BoardEntry entry = board.getEntries().stream()
                .filter(e -> e.getEntryId().equals(entryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        BoardAnswer answer = BoardAnswer.builder()
                .authorUserId(authorUserId)
                .comment(comment)
                .createdAt(Instant.now())
                .build();

        entry.setBoardAnswer(answer);
        return boardRepository.save(board);
    }

    @Transactional(readOnly = true) // 데이터를 읽기만 하므로 readOnly=true 설정 (성능 최적화)
    public Board getBoard(String boardId, String actingUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + boardId));

        if (!board.getMemberUserIds().contains(actingUserId)) {
            throw new IllegalStateException("You do not have permission to view this board.");
        }

        return board;
    }
}