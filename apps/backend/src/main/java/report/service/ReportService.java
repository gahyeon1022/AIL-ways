package report.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.repository.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import report.domain.MentorFeedback;
import report.domain.Report;
import report.domain.SelfFeedback;
import report.dto.CreateReportRequest;
import report.repository.ReportRepository;


import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final MatchRepository matchRepository;

    /**
     * API: POST /api/reports
     * 새로운 학습 리포트를 생성합니다.
     */

    @Transactional
    public Report createReport(CreateReportRequest req, String menteeUserId) {
        // 요청한 사용자가 리포트의 주체(멘티)가 맞는지 확인
        if (!req.menteeUserId().equals(menteeUserId)) {
            throw new IllegalStateException("You can only create reports for yourself.");
        }
        // 매칭 정보가 유효하고, 요청자가 멤버인지 확인
        checkMatchMembership(req.matchId(), menteeUserId);

        Report report = Report.builder()
                .matchId(req.matchId())
                .menteeUserId(req.menteeUserId())
                .aiSummary(req.aiSummary())
                .distractionLogs(req.distractionLogs())
                .createdAt(Instant.now())
                .build();

        return reportRepository.save(report);
    }

    // --- 조회 로직 ---

    /**
     * API: GET /api/reports/by-match/{matchId}
     * 특정 매칭에 속한 모든 보고서 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<Report> getReportsByMatchId(String matchId, String actingUserId) {
        checkMatchMembership(matchId, actingUserId); // 권한 체크
        return reportRepository.findByMatchId(matchId);
    }

    /**
     * API: GET /api/reports/{reportId}
     * 특정 보고서의 상세 정보를 조회합니다.
     */
    @Transactional(readOnly = true)
    public Report getReportById(String reportId, String actingUserId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        checkMatchMembership(report.getMatchId(), actingUserId); // 권한 체크
        return report;
    }

    // --- 수정 및 추가 로직 ---

    /**
     * API: POST /api/reports/{reportId}/feedback
     * 보고서에 멘토의 피드백을 추가합니다.
     */
    @Transactional
    public Report addMentorFeedback(String reportId, String mentorUserId, String comment) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        Match match = checkMatchMembership(report.getMatchId(), mentorUserId);

        // 이 로직은 멘토만 피드백을 남길 수 있도록 보장합니다.
        if (!match.getMentorUserId().equals(mentorUserId)) {
            throw new IllegalStateException("Only the mentor of this match can add feedback.");
        }
        // 명세서 요구사항: 이미 피드백이 존재하면 Conflict 에러
        if (report.getMentorFeedback() != null) {
            throw new IllegalStateException("Mentor feedback already exists on this report.");
        }

        MentorFeedback feedback = MentorFeedback.builder()
                .mentorUserId(mentorUserId)
                .comment(comment)
                .createdAt(Instant.now())
                .build();

        report.setMentorFeedback(feedback);
        return reportRepository.save(report);
    }

    /**
     * API: POST /api/reports/{reportId}/distractions/{logIndex}/feedback
     * '딴짓 로그'에 멘티의 자기 피드백을 추가합니다.
     */
    @Transactional
    public Report addSelfFeedback(String reportId, int logIndex, String menteeUserId, String comment) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report not found: " + reportId));
        Match match = checkMatchMembership(report.getMatchId(), menteeUserId);

        // 이 로직은 멘티만 자기 피드백을 남길 수 있도록 보장합니다.
        if (!match.getMenteeUserId().equals(menteeUserId)) {
            throw new IllegalStateException("Only the mentee of this match can add self-feedback.");
        }
        // 명세서 요구사항: logIndex가 유효한 범위인지 확인
        if (logIndex < 0 || report.getDistractionLogs() == null || logIndex >= report.getDistractionLogs().size()) {
            throw new IndexOutOfBoundsException("Distraction log index is out of bounds.");
        }
        // 명세서 요구사항: 이미 자기 피드백이 존재하면 Conflict 에러
        if (report.getDistractionLogs().get(logIndex).getSelfFeedback() != null) {
            throw new IllegalStateException("Self-feedback already exists on this distraction log.");
        }

        SelfFeedback feedback = SelfFeedback.builder()
                .comment(comment)
                .createdAt(Instant.now())
                .build();

        report.getDistractionLogs().get(logIndex).setSelfFeedback(feedback);
        return reportRepository.save(report);
    }

    /**
     * [공통 메서드]
     * 요청을 보낸 사용자가 해당 매칭의 멤버(멘토 또는 멘티)인지 확인합니다.
     * @return Match 엔티티 (검사 통과 시)
     */
    private Match checkMatchMembership(String matchId, String actingUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        boolean isMember = match.getMentorUserId().equals(actingUserId) || match.getMenteeUserId().equals(actingUserId);
        if (!isMember) {
            throw new IllegalStateException("User " + actingUserId + " is not a member of match " + matchId);
        }
        return match;
    }


}

