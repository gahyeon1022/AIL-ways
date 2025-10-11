package session.controller;

import common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import session.domain.SelfFeedback;
import session.domain.StudySession;
import session.dto.StudySessionDTO;
import session.service.StudySessionService;

@Tag(name = "StudySession API", description = "학습 세션 관련 API")
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class StudySessionController {

    private final StudySessionService studyService;

    @Operation(summary = "학습 시작", description = "학습 세션 시작")
    @PostMapping("/start")
    public ApiResponse<StudySessionDTO> start(@RequestParam String matchId,
                                              @RequestParam String mentorUserId,
                                              Authentication auth) {
        String menteeUserId = auth.getName();
        return ApiResponse.ok(studyService.startSession(matchId, menteeUserId, mentorUserId));
    }

    @Operation(summary = "학습 종료", description = "학습 세션 종료") //
    @PostMapping("/{sessionId}/end")
    public ApiResponse<StudySession> end(@PathVariable String sessionId) {
        return ApiResponse.ok(studyService.endSession(sessionId));
    }

    @Operation(summary = "AI 감지 딴짓 로그 저장", description = "AI가 감지한 딴짓 이벤트를 세션에 저장")
    @PostMapping("/{sessionId}/distractions")
    public ApiResponse<StudySession> addDistraction(
            @PathVariable String sessionId,
            @RequestParam String activity) {
        return ApiResponse.ok(studyService.addDistraction(sessionId, activity));
    }

    @Operation(summary = "멘티 자기 피드백 기록", description = "딴짓 발생 후 멘티가 자기 피드백을 작성")
    @PostMapping("/{sessionId}/distractions/selfFeedback")
    public ApiResponse<StudySession> addSelfFeedback(
            @PathVariable String sessionId,
            @RequestBody SelfFeedback selfFeedback) {
        return ApiResponse.ok(studyService.addSelfFeedback(sessionId, selfFeedback));
    }

    @Operation(summary = "학습 재개", description = "피드백 후 학습을 다시 시작")
    @PostMapping("/{sessionId}/resume")
    public ApiResponse<StudySession> resume(@PathVariable String sessionId) {
        return ApiResponse.ok(studyService.resumeSession(sessionId));
    }

    @Operation(summary = "학습 내용 입력", description = "세션 진행 동안 학습한 내용 입력")
    @PostMapping("/{sessionId}/studyLogs")
    public ApiResponse<StudySession> addStudyLog(@PathVariable String sessionId,
                                                 @RequestParam String content,
                                                 Authentication auth) {
        String authorUserId = auth.getName();
        return ApiResponse.ok(studyService.addStudyLog(sessionId, authorUserId, content));
    }

    @Operation(summary = "질문 내용 입력", description = "세션 진행 중 궁금한 내용을 입력")
    @PostMapping("/{sessionId}/questionLogs")
    public ApiResponse<StudySession> addQuestionLog(@PathVariable String sessionId,
                                                    @RequestParam String question,
                                                    Authentication auth) {
        String authorUserId = auth.getName();
        return ApiResponse.ok(studyService.addQuestionLog(sessionId, authorUserId, question));
    }
}