package session.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import session.domain.SessionStatus;
import session.domain.StudySession;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudySessionRepository extends MongoRepository<StudySession, String> {
    // ✅ matchId + status로 세션 조회 (ACTIVE 중복 방지용)
    Optional<StudySession> findByMatchIdAndStatus(String matchId, SessionStatus status);

    List<StudySession> findByMatchIdAndEndedAtBetween(String matchId, Instant start, Instant end);
}
