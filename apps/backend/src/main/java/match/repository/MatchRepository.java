package match.repository;

import match.domain.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<Match> findByPairKey(String pairKey);

    List<Match> findByMentorUserId(String mentorUserId);

}
