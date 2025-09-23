package board.controller;

import board.domain.Board;
import board.dto.AddAnswerRequest;
import board.dto.AddEntryRequest;
import board.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /** 멘티가 질문 노트 추가 */
    @PostMapping("/{boardId}/entries")
    public ResponseEntity<Board> addEntry(@PathVariable String boardId,
                                          @RequestBody @Valid AddEntryRequest req) {
        String authorUserId = req.authorUserId();
        Board updatedBoard = boardService.addEntryToBoard(boardId, authorUserId, req.title(), req.questionNote());
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedBoard);
    }

    /** 멘토가 답변 추가 */
    @PostMapping("/{boardId}/entries/{entryId}/answer")
    public ResponseEntity<Board> addAnswer(@PathVariable String boardId,
                                           @PathVariable String entryId,
                                           @RequestBody @Valid AddAnswerRequest req) {
        String authorUserId = req.authorUserId();
        Board updatedBoard = boardService.addAnswerToEntry(boardId, entryId, authorUserId, req.comment());
        return ResponseEntity.ok(updatedBoard);
    }


    @GetMapping("/{boardId}")
    public ResponseEntity<Board> getBoardById(@PathVariable String boardId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        String actingUserId = userDetails.getUsername();
        Board board = boardService.getBoard(boardId, actingUserId);
        return ResponseEntity.ok(board);
    }

}