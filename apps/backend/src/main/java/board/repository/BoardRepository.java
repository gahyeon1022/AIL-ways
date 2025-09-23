package board.repository;

import board.domain.Board;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface BoardRepository extends MongoRepository<Board, String> {
    Optional<Board> findByMatchId(String matchId);
}
