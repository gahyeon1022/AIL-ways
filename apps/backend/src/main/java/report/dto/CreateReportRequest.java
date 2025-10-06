package report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import report.domain.DistractionLog;

import java.util.List;

/**
 * 세션 종료 후 Report 생성을 위한 Request DTO 입니다.
 */
public record CreateReportRequest(
        @NotBlank String matchId,
        @NotBlank String menteeUserId,
        @NotBlank String aiSummary,
        @NotNull List<DistractionLog> distractionLogs
) {}
