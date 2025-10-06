package report.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import report.domain.Report;

import java.util.List;

/**
 * Report 도큐먼트에 대한 데이터베이스 작업을 처리합니다.
 */
@Repository
// MongoRepository를 상속받아 기본적인 CRUD 기능을 자동으로 사용합니다.
public interface ReportRepository extends MongoRepository<Report, String> {

    /**
     * 특정 matchId에 해당하는 모든 리포트를 생성 시간 내림차순으로 조회합니다.
     * @param matchId 매칭 ID
     * @return Report 리스트
     */
    List<Report> findByMatchId(String matchId);
}
