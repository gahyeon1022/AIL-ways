package report.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyReportScheduler {

    private final WeeklyReportService weeklyReportService;

    @Value("${report.weekly.scheduler-enabled:true}")
    private boolean schedulerEnabled;

    @Scheduled(cron = "0 0 10 * * MON", zone = "${report.weekly.cron-zone:Asia/Seoul}")
    public void runWeeklyGeneration() {
        if (!schedulerEnabled) {
            return;
        }

        WeeklyReportService.GenerationResult result = weeklyReportService.generateReportsForPreviousWeek(false);
        log.info("Scheduled weekly report generation finished. {}", result);
    }
}
