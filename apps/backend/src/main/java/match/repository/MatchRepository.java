package match.repository;

import match.domain.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import match.domain.MatchStatus;

import java.util.List;

import java.util.Optional;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<Match> findByPairKey(String pairKey);

    List<Match> findByMentorUserId(String mentorUserId);
    List<Match> findByMenteeUserId(String menteeUserId);
    List<Match> findByMentorUserIdAndStatus(String mentorUserId, MatchStatus status);
    List<Match> findByMenteeUserIdAndStatus(String menteeUserId, MatchStatus status);
}
