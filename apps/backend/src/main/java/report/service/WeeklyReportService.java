package report.service;

import lombok.extern.slf4j.Slf4j;
import match.domain.Match;
import match.domain.MatchStatus;
import match.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import report.domain.WeeklyReport;
import report.repository.WeeklyReportRepository;
import session.domain.DistractionLog;
import session.domain.StudySession;
import session.repository.StudySessionRepository;
import session.service.StudySessionMetrics;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class WeeklyReportService {

    private static final List<DayOfWeek> DAY_ORDER = List.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
            DayOfWeek.SUNDAY
    );

    private static final Map<DayOfWeek, String> DAY_LABELS = Map.of(
            DayOfWeek.MONDAY, "월",
            DayOfWeek.TUESDAY, "화",
            DayOfWeek.WEDNESDAY, "수",
            DayOfWeek.THURSDAY, "목",
            DayOfWeek.FRIDAY, "금",
            DayOfWeek.SATURDAY, "토",
            DayOfWeek.SUNDAY, "일"
    );

    private final WeeklyReportRepository weeklyReportRepository;
    private final StudySessionRepository studySessionRepository;
    private final MatchRepository matchRepository;
    private final WeeklySummaryAiClient weeklySummaryAiClient;
    private final ZoneId zoneId;
    private final int defaultFocusAverage;

    public WeeklyReportService(WeeklyReportRepository weeklyReportRepository,
                               StudySessionRepository studySessionRepository,
                               MatchRepository matchRepository,
                               WeeklySummaryAiClient weeklySummaryAiClient,
                               @Value("${report.weekly.timezone:Asia/Seoul}") String timezone,
                               @Value("${report.weekly.focus-average:75}") int focusAverage) {
        this.weeklyReportRepository = weeklyReportRepository;
        this.studySessionRepository = studySessionRepository;
        this.matchRepository = matchRepository;
        this.weeklySummaryAiClient = weeklySummaryAiClient;
        this.zoneId = ZoneId.of(timezone);
        this.defaultFocusAverage = focusAverage;
    }

    @Transactional
    public GenerationResult generateReportsForPreviousWeek(boolean overwriteExisting) {
        LocalDate currentWeekStart = LocalDate.now(zoneId).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate targetWeekStart = currentWeekStart.minusWeeks(1);
        return generateReportsForWeek(targetWeekStart, overwriteExisting);
    }

    @Transactional
    public GenerationResult generateReportsForWeek(LocalDate requestedWeekStart, boolean overwriteExisting) {
        LocalDate normalizedWeekStart = requestedWeekStart.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        Instant startInstant = normalizedWeekStart.atStartOfDay(zoneId).toInstant();
        Instant endInstant = normalizedWeekStart.plusDays(7).atStartOfDay(zoneId).minusNanos(1).toInstant();

        List<Match> acceptedMatches = matchRepository.findAll().stream()
                .filter(match -> match.getStatus() == MatchStatus.ACCEPTED)
                .collect(Collectors.toList());

        int generated = 0;
        int skipped = 0;
        for (Match match : acceptedMatches) {
            if (log.isDebugEnabled()) {
                log.debug("Processing matchId={} mentee={} mentor={}", match.getMatchId(), match.getMenteeUserId(), match.getMentorUserId());
            }

            if (match.getMatchId() == null) {
                skipped++;
                log.warn("Skipping match without matchId. mentor={}, mentee={}, status={}", match.getMentorUserId(), match.getMenteeUserId(), match.getStatus());
                continue;
            }
            Optional<WeeklyReport> existing = weeklyReportRepository.findByMatchIdAndWeekStart(match.getMatchId(), startInstant);
            if (existing.isPresent() && !overwriteExisting) {
                skipped++;
                if (log.isDebugEnabled()) {
                    log.debug("Skipping matchId={} because weekly report already exists and overwrite=false", match.getMatchId());
                }
                continue;
            }

            List<StudySession> sessions = studySessionRepository
                    .findByMatchIdAndEndedAtBetween(match.getMatchId(), startInstant, endInstant);
            if (log.isDebugEnabled()) {
                log.debug("Found {} sessions for matchId={} within {} - {}", sessions.size(), match.getMatchId(), startInstant, endInstant);
                for (StudySession s : sessions) {
                    log.debug("Session {} status={} startedAt={} endedAt={}", s.getSessionId(), s.getStatus(), s.getStartedAt(), s.getEndedAt());
                }
            }

            List<StudySession> completedSessions = sessions.stream()
                    .filter(session -> session.getStartedAt() != null && session.getEndedAt() != null)
                    .collect(Collectors.toList());

            if (completedSessions.isEmpty()) {
                skipped++;
                if (log.isDebugEnabled()) {
                    log.debug("Skipping matchId={} because completed session list is empty", match.getMatchId());
                }
                continue;
            }

            WeeklyAggregate aggregate = aggregateSessions(completedSessions);
            if (aggregate.totalHoursRaw() <= 0) {
                skipped++;
                if (log.isDebugEnabled()) {
                    log.debug("Skipping matchId={} because totalHours calculated as {}", match.getMatchId(), aggregate.totalHoursRaw());
                }
                continue;
            }

            String aiSummary = weeklySummaryAiClient.summarize(
                    aggregate.studyHours(),
                    aggregate.totalHours(),
                    aggregate.focusMe(),
                    aggregate.focusAvg()
            );

            existing.ifPresent(report -> {
                if (overwriteExisting) {
                    weeklyReportRepository.deleteById(report.getId());
                }
            });

            WeeklyReport weeklyReport = WeeklyReport.builder()
                    .matchId(match.getMatchId())
                    .menteeUserId(match.getMenteeUserId())
                    .mentorUserId(match.getMentorUserId())
                    .weekStart(startInstant)
                    .weekEnd(endInstant)
                    .studyHours(aggregate.studyHours())
                    .totalHours(aggregate.totalHours())
                    .focusMe(aggregate.focusMe())
                    .focusAvg(aggregate.focusAvg())
                    .aiSummary(aiSummary)
                    .generatedAt(Instant.now())
                    .build();

            weeklyReportRepository.save(weeklyReport);
            generated++;
        }

        log.info("Weekly reports generated. weekStart={}, generated={}, skipped={}, matches={}",
                normalizedWeekStart, generated, skipped, acceptedMatches.size());

        return new GenerationResult(normalizedWeekStart, generated, skipped, acceptedMatches.size());
    }

    @Transactional(readOnly = true)
    public List<WeeklyReport> getReportsByMatch(String matchId, String actingUserId) {
        validateMatchMembership(matchId, actingUserId);
        return weeklyReportRepository.findByMatchIdOrderByWeekStartDesc(matchId);
    }

    @Transactional(readOnly = true)
    public Optional<WeeklyReport> getLatestReportByMatch(String matchId, String actingUserId) {
        validateMatchMembership(matchId, actingUserId);
        return weeklyReportRepository.findFirstByMatchIdOrderByWeekStartDesc(matchId);
    }

    private WeeklyAggregate aggregateSessions(List<StudySession> sessions) {
        Map<String, Double> studyHours = initializeStudyHourBuckets();
        double totalMinutes = 0;
        int distractionCount = 0;

        for (StudySession session : sessions) {
            double effectiveMinutes = StudySessionMetrics.calculateNetMinutes(session);
            if (effectiveMinutes <= 0) {
                continue;
            }
            totalMinutes += effectiveMinutes;

            ZonedDateTime localStart = session.getStartedAt().atZone(zoneId);
            String dayLabel = DAY_LABELS.get(localStart.getDayOfWeek());
            if (dayLabel != null) {
                studyHours.merge(dayLabel, effectiveMinutes / 60.0, Double::sum);
            }

            distractionCount += countDistractions(session);
        }

        studyHours.replaceAll((k, v) -> roundToOneDecimal(v));
        double totalHoursRaw = totalMinutes / 60.0;
        double totalHours = roundToOneDecimal(totalHoursRaw);
        int focusMe = calculateFocusScore(totalHours, distractionCount);
        int focusAvg = defaultFocusAverage;

        return new WeeklyAggregate(studyHours, totalHours, focusMe, focusAvg, totalHoursRaw);
    }

    private Map<String, Double> initializeStudyHourBuckets() {
        Map<String, Double> buckets = new LinkedHashMap<>();
        for (DayOfWeek day : DAY_ORDER) {
            buckets.put(DAY_LABELS.get(day), 0.0);
        }
        return buckets;
    }

    private int countDistractions(StudySession session) {
        List<DistractionLog> logs = session.getDistractionLogs();
        return logs == null ? 0 : logs.size();
    }


    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private int calculateFocusScore(double totalHours, int distractions) {
        double base = 70.0;
        base += Math.min(20.0, totalHours * 1.5); // 더 오래 공부하면 점수 추가
        base -= Math.min(40.0, distractions * 4.0); // 딴짓이 많을수록 감점
        int score = (int) Math.round(base);
        return Math.max(40, Math.min(95, score));
    }

    private Match validateMatchMembership(String matchId, String actingUserId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        if (!match.getMentorUserId().equals(actingUserId) && !match.getMenteeUserId().equals(actingUserId)) {
            throw new IllegalStateException("User " + actingUserId + " is not a member of match " + matchId);
        }
        return match;
    }

    private record WeeklyAggregate(
            Map<String, Double> studyHours,
            double totalHours,
            int focusMe,
            int focusAvg,
            double totalHoursRaw
    ) {
    }

    public record GenerationResult(
            LocalDate weekStart,
            int generatedCount,
            int skippedCount,
            int totalMatches
    ) {
    }
}
