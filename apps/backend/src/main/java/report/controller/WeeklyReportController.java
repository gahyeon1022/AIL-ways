package report.controller;

import common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import report.domain.WeeklyReport;
import report.service.WeeklyReportService;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Weekly Report API")
@RestController
@RequestMapping("/api/reports/weekly")
@RequiredArgsConstructor
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    @Operation(summary = "매칭별 주간 리포트 목록 조회")
    @GetMapping("/by-match/{matchId}")
    public ApiResponse<List<WeeklyReport>> getWeeklyReportsByMatch(@PathVariable String matchId,
                                                                   Authentication auth) {
        return ApiResponse.ok(
                weeklyReportService.getReportsByMatch(matchId, auth.getName())
        );
    }

    @Operation(summary = "매칭별 최신 주간 리포트 조회")
    @GetMapping("/latest/{matchId}")
    public ApiResponse<WeeklyReport> getLatestWeeklyReport(@PathVariable String matchId,
                                                           Authentication auth) {
        return weeklyReportService.getLatestReportByMatch(matchId, auth.getName())
                .map(ApiResponse::ok)
                .orElseGet(() -> ApiResponse.ok(null));
    }

    @Operation(summary = "주간 리포트 수동 생성", description = "테스트 용도로, 특정 주의 리포트를 즉시 생성합니다.")
    @PostMapping("/generate")
    public ApiResponse<WeeklyReportService.GenerationResult> generateWeeklyReport(
            @RequestParam(value = "weekStart", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam(value = "overwrite", defaultValue = "false") boolean overwrite,
            Authentication auth) {

        WeeklyReportService.GenerationResult result = (weekStart == null)
                ? weeklyReportService.generateReportsForPreviousWeek(overwrite)
                : weeklyReportService.generateReportsForWeek(weekStart, overwrite);

        return ApiResponse.ok(result);
    }
}
