package session.controller;

import common.dto.ApiError;
import common.dto.ApiResponse;
import common.dto.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import session.domain.StudySession;
import session.service.StudySessionService;

import java.time.Instant;
import java.util.List;

@Tag(name = "StudySession API", description = "학습 세션 관련 API")
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studyService;

    @Operation(summary = "학습 시작", description = "학습 세션 시작")
    @PostMapping("/start")
    public ApiResponse<StudySession> start(@RequestParam String matchId,
                                           @RequestParam String menteeUserId,
                                           @RequestParam String mentorUserId) {
        return ApiResponse.ok(studyService.startSession(matchId, menteeUserId, mentorUserId));
    }

    @Operation(summary = "학습 종료", description = "학습 세션 종료") //
    @PostMapping("/{sessionId}/end")
    public ApiResponse<StudySession> end(@PathVariable String sessionId) {
        return ApiResponse.ok(studyService.endSession(sessionId));
    }

    @Operation(summary = "딴 짓 로그 기록", description = "학습 세션 간 발생한 딴 짓 기록")
    @PostMapping("/{sessionId}/distractions")
    public ApiResponse<StudySession> addDistraction(@PathVariable String sessionId,
                                                    @RequestParam String activity) {
        return ApiResponse.ok(studyService.addDistraction(sessionId, activity, Instant.now()));
    }

    @Operation(summary = "학습 내용 입력", description = "세션 진행 동안 학습한 내용 입력")
    @PostMapping("/{sessionId}/logs")
    public ApiResponse<StudySession> addStudyLog(@PathVariable String sessionId,
                                                 @RequestParam String authorUserId,
                                                 @RequestParam String content) {
        return ApiResponse.ok(studyService.addStudyLog(sessionId, authorUserId, content));
    }

    @Operation(summary = "멘티 세션 목록 조회", description = "특정 멘티가 진행한 모든 학습 세션을 조회합니다.")
    @GetMapping("/mentee/{menteeUserId}")
    public ApiResponse<List<StudySession>> getByMentee(@PathVariable String menteeUserId) {
        return ApiResponse.ok(studyService.getByMentee(menteeUserId));
    }

    @Operation(summary = "매칭별 세션 목록 조회", description = "특정 매칭에서 진행된 모든 학습 세션을 조회합니다.")
    @GetMapping("/match/{matchId}")
    public ApiResponse<List<StudySession>> getByMatch(@PathVariable String matchId) {
        return ApiResponse.ok(studyService.getByMatch(matchId));
    }
}