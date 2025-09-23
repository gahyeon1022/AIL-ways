package match.repository;

import match.domain.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import java.util.Optional;

public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<Match> findByPairKey(String pairKey);

    List<Match> findByMentorUserId(String mentorUserId);

}
