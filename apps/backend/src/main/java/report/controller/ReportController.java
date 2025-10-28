package report.controller;

import common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import report.domain.Report;
import report.dto.AddFeedbackRequest;
import report.service.ReportService;

import java.util.List;

@Tag(name = "Report API", description = "학습 보고서 조회 및 피드백 관리 API")
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "매칭별 보고서 목록 조회", description = "특정 매칭(matchId)에 속한 모든 학습 보고서 목록을 조회합니다.")
    @GetMapping("/by-match/{matchId}")
    public ApiResponse<List<Report>> getReportsByMatch(@PathVariable String matchId, Authentication auth) {
        String actingUserId = auth.getName();
        return ApiResponse.ok(reportService.getReportsByMatchId(matchId, actingUserId));
    }

    @Operation(summary = "특정 보고서 상세 조회", description = "보고서의 고유 ID(reportId)로 상세 내용을 조회합니다.")
    @GetMapping("/{reportId}")
    public ApiResponse<Report> getReportById(@PathVariable String reportId, Authentication auth) {
        String actingUserId = auth.getName();
        return ApiResponse.ok(reportService.getReportById(reportId, actingUserId));
    }

    @Operation(summary = "보고서에 멘토 피드백 추가", description = "멘토가 특정 보고서에 최종 피드백을 추가합니다.")
    @PostMapping("/{reportId}/feedback")
    public ApiResponse<Report> addMentorFeedback(@PathVariable String reportId,
                                                 @RequestBody @Valid AddFeedbackRequest req,
                                                 Authentication auth) {
        String mentorUserId = auth.getName();
        return ApiResponse.ok(reportService.addMentorFeedback(reportId, mentorUserId, req.comment()));
    }
}
