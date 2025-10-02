package board.controller;

import board.domain.Board;
import board.dto.AddAnswerRequest;
import board.dto.AddEntryRequest;
import board.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

@Tag(name = "Board API", description = "멘토-멘티 Q&A 보드 및 게시글 관리")
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /** 멘티가 질문 노트 추가 */

    @Operation(summary = "보드에 게시글 작성", description = "멘티가 Q&A 글을 등록합니다")
    @PostMapping("/{boardId}/entries")
    public ResponseEntity<Board> addEntry(@PathVariable String boardId,
                                          @RequestBody @Valid AddEntryRequest req) {
        String authorUserId = req.authorUserId();
        Board updatedBoard = boardService.addEntryToBoard(boardId, authorUserId, req.title(), req.questionNote());
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedBoard);
    }

    /** 멘토가 답변 추가 */

    @Operation(summary = "보드에 답변 작성", description = "멘토가 Q&A 답변을 등록합니다")
    @PostMapping("/{boardId}/entries/{entryId}/answer")
    public ResponseEntity<Board> addAnswer(@PathVariable String boardId,
                                           @PathVariable String entryId,
                                           @RequestBody @Valid AddAnswerRequest req) {
        String authorUserId = req.authorUserId();
        Board updatedBoard = boardService.addAnswerToEntry(boardId, entryId, authorUserId, req.comment());
        return ResponseEntity.ok(updatedBoard);
    }

    @Operation(summary = "보드 조회", description = "멘토-멘티 보드 상세 조회")
    @GetMapping("/{boardId}")
    public ResponseEntity<Board> getBoardById(@PathVariable String boardId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        String actingUserId = userDetails.getUsername();
        Board board = boardService.getBoard(boardId, actingUserId);
        return ResponseEntity.ok(board);
    }

}