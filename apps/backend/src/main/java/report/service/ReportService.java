package report.service;

import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.repository.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import report.domain.MentorFeedback;
import report.domain.Report;
import report.repository.ReportRepository;
import session.domain.StudySession;
import java.util.stream.Collectors;


import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final MatchRepository matchRepository;

    private final AiSummaryService aiSummaryService;
    /**
     * StudySession이 종료된 후 호출되어 학습 리포트를 생성하고 저장합니다.
     * @param endedSession 종료된 학습 세션 객체
     */
    @Transactional
    public void createReportFromSession(StudySession endedSession) {
        // 2. 학습 로그(studyLogs)를 하나의 문자열로 합칩니다.
        String studyContents = endedSession.getStudyLogs().stream()
                .map(log -> log.getContent())
                .collect(Collectors.joining("\n"));

        // 3. AiSummaryService를 호출하여 요약된 내용을 받습니다.
        String summary = aiSummaryService.summarize(studyContents);

        // 4. 세션의 딴짓 로그를 리포트의 딴짓 로그 형식으로 변환합니다. (이전 단계에서 완성)
        List<report.domain.DistractionLog> reportDistractionLogs = endedSession.getDistractionLogs().stream()
                .map(this::toReportDistractionLog)
                .collect(Collectors.toList());

        // 5. 변환된 데이터를 바탕으로 새로운 Report 객체를 생성합니다.
        Report report = Report.builder()
                .matchId(endedSession.getMatchId())
                .menteeUserId(endedSession.getMenteeUserId())
                .aiSummary(summary) // AI가 생성한 요약문을 저장
                .distractionLogs(reportDistractionLogs)
                .createdAt(Instant.now())
                .build();

        reportRepository.save(report);
    }


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

    /**
     * StudySession의 딴짓 로그를 Report 도메인으로 변환하면서 멘티 셀프 피드백을 복사합니다.
     */
    private report.domain.DistractionLog toReportDistractionLog(session.domain.DistractionLog sessionLog) {
        report.domain.SelfFeedback reportSelfFeedback = null;
        if (sessionLog.getSelfFeedback() != null) {
            reportSelfFeedback = report.domain.SelfFeedback.builder()
                    .comment(sessionLog.getSelfFeedback().getComment())
                    .createdAt(sessionLog.getSelfFeedback().getCreatedAt())
                    .build();
        }

        return report.domain.DistractionLog.builder()
                .activity(sessionLog.getActivity())
                .detectedAt(sessionLog.getDetectedAt())
                .selfFeedback(reportSelfFeedback)
                .build();
    }
}
