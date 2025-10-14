package session.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import session.domain.StudySession;

@Repository
public interface StudySessionRepository extends MongoRepository<StudySession, String> {
}