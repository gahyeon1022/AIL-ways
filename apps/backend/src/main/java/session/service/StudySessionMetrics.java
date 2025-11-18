package session.service;

import session.domain.DistractionLog;
import session.domain.SelfFeedback;
import session.domain.StudySession;

import java.time.Duration;
import java.util.List;

/**
 * Utility methods for calculating study durations derived from a StudySession and its distraction logs.
 */
public final class StudySessionMetrics {

    private static final double MILLIS_PER_MINUTE = 60000.0;

    private StudySessionMetrics() {
    }

    public static double calculateTotalMinutes(StudySession session) {
        if (session == null || session.getStartedAt() == null || session.getEndedAt() == null) {
            return 0.0;
        }
        Duration duration = Duration.between(session.getStartedAt(), session.getEndedAt());
        if (duration.isNegative() || duration.isZero()) {
            return 0.0;
        }
        return duration.toMillis() / MILLIS_PER_MINUTE;
    }

    public static double calculateDistractionMinutes(StudySession session) {
        if (session == null) {
            return 0.0;
        }
        List<DistractionLog> logs = session.getDistractionLogs();
        if (logs == null || logs.isEmpty()) {
            return 0.0;
        }

        double total = 0.0;
        for (DistractionLog log : logs) {
            if (log == null || log.getDetectedAt() == null) {
                continue;
            }
            SelfFeedback feedback = log.getSelfFeedback();
            if (feedback == null || feedback.getCreatedAt() == null) {
                continue;
            }

            Duration distractionDuration = Duration.between(log.getDetectedAt(), feedback.getCreatedAt());
            if (distractionDuration.isNegative() || distractionDuration.isZero()) {
                continue;
            }
            total += distractionDuration.toMillis() / MILLIS_PER_MINUTE;
        }
        return total;
    }

    public static double calculateNetMinutes(StudySession session) {
        double totalMinutes = calculateTotalMinutes(session);
        if (totalMinutes <= 0) {
            return 0.0;
        }
        double distractionMinutes = calculateDistractionMinutes(session);
        return Math.max(0.0, totalMinutes - distractionMinutes);
    }
}
