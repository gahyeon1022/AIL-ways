package session.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import session.domain.StudySession;

import java.util.List;

@Repository
public interface StudySessionRepository extends MongoRepository<StudySession, String> {
    List<StudySession> findByMenteeUserId(String menteeUserId);
    List<StudySession> findByMatchId(String matchId);
}