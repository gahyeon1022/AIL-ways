package report.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import report.domain.WeeklyReport;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyReportRepository extends MongoRepository<WeeklyReport, String> {

    Optional<WeeklyReport> findByMatchIdAndWeekStart(String matchId, Instant weekStart);

    List<WeeklyReport> findByMatchIdOrderByWeekStartDesc(String matchId);

    Optional<WeeklyReport> findFirstByMatchIdOrderByWeekStartDesc(String matchId);
}
