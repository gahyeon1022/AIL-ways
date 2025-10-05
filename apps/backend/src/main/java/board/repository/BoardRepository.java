package board.repository;

import board.domain.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardRepository extends MongoRepository<Board, String> {
    Optional<Board> findByMatchId(String matchId);
    Optional<Board> findByPairKey(String pairKey);

}
