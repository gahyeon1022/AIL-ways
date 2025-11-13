package board.controller;

import board.domain.Board;
import board.dto.AddCommentRequest;
import board.dto.AddEntryRequest;
import board.service.BoardService;
import common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Tag(name = "Board API", description = "멘토-멘티 Q&A 보드 및 게시글 관리")
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @Operation(summary = "ID로 보드 조회", description = "보드의 고유 ID를 사용하여 Q&A 보드 상세 정보를 조회합니다.")
    @GetMapping("/{boardId}")
    public ApiResponse<Board> getBoardById(@PathVariable String boardId,
                                           Authentication auth) {
        String actingUserId = auth.getName();
        return ApiResponse.ok(boardService.getBoard(boardId, actingUserId));
    }

    // ✅ 'pairKey'를 활용하여 두 사용자의 보드를 조회하는 API 추가
    @Operation(summary = "사용자 ID로 보드 조회", description = "멘토와 멘티의 userId를 사용하여 Q&A 보드를 조회합니다.")
    @GetMapping("/by-users")
    public ApiResponse<Board> getBoardByUserIds(@RequestParam String userId1,
                                                @RequestParam String userId2,
                                                Authentication auth) {
        String actingUserId = auth.getName();
        return ApiResponse.ok(boardService.getBoardByUserIds(userId1, userId2, actingUserId));
    }

    @Operation(summary = "보드에 게시글 작성", description = "인증된 사용자가 Q&A 글을 등록합니다.")
    @PostMapping("/{boardId}/entries")
    public ApiResponse<Board> addEntry(@PathVariable String boardId,
                                       @RequestBody @Valid AddEntryRequest req,
                                       Authentication auth) {
        String authorUserId = auth.getName();
        return ApiResponse.ok(boardService.addEntryToBoard(boardId, authorUserId, req.title(), req.questionNote()));
    }

    @Operation(summary = "게시글에 댓글/대댓글 작성", description = "멘토와 멘티가 댓글 또는 대댓글 형태로 질의응답을 이어갑니다.")
    @PostMapping("/{boardId}/entries/{entryId}/comments")
    public ApiResponse<Board> addComment(@PathVariable String boardId,
                                         @PathVariable String entryId,
                                         @RequestBody @Valid AddCommentRequest req,
                                         Authentication auth) {
        String authorUserId = auth.getName();
        try {
            return ApiResponse.ok(boardService.addCommentToEntry(
                    boardId,
                    entryId,
                    authorUserId,
                    req.comment(),
                    req.parentCommentId()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }

    // ✅ POST 대신 PATCH를 사용하여 리소스의 부분 수정을 명확하게 표현
    @Operation(summary = "게시글 완료 처리", description = "게시글을 '완료' 상태로 변경합니다.")
    @PatchMapping("/{boardId}/entries/{entryId}/complete")
    public ApiResponse<Board> completeEntry(@PathVariable String boardId,
                                            @PathVariable String entryId,
                                            Authentication auth) {
        String actingUserId = auth.getName();
        try {
            return ApiResponse.ok(boardService.completeEntry(boardId, entryId, actingUserId));
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        }
    }
}
