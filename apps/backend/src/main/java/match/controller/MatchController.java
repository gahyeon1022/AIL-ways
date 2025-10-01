package match.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.dto.MenteeInfoDTO;
import match.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Match API", description = "멘토-멘티 매칭 요청, 수락, 거절 API")
@RestController
@RequestMapping("/matches") // /api prefix 삭제
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /** 멘티가 멘토 userId를 입력해서 매칭 요청 */
    @Operation(summary = "매칭 요청", description = "멘티가 멘토에게 매칭 요청을 보냅니다")
    @PostMapping("/request")
    public ResponseEntity<Match> request(@RequestBody MatchRequest req) {
        return ResponseEntity.ok(
                matchService.requestMatch(req.menteeUserId(), req.mentorUserId())
        );
    }

    /** 멘토가 수락 */
    @Operation(summary = "매칭 수락", description = "멘토가 멘티의 매칭 요청을 수락합니다")
    @PostMapping("/{matchId}/accept")
    public ResponseEntity<Void> accept(@PathVariable String matchId,
                                       @RequestParam String actingUserId) {
        matchService.accept(matchId, actingUserId);
        return ResponseEntity.ok().build();
    }



    /** 멘토가 거절 */
    @Operation(summary = "매칭 거절", description = "멘토가 멘티의 매칭 요청을 거절합니다")
    @PostMapping("/{matchId}/reject")
    public ResponseEntity<Void> reject(@PathVariable String matchId,
                                       @RequestParam String actingUserId) {
        matchService.reject(matchId, actingUserId);
        return ResponseEntity.ok().build();
    }

    /** 특정 멘토의 모든 멘티 목록 조회 */
    @GetMapping("/{mentorId}/mentees")
    public ResponseEntity<List<MenteeInfoDTO>> getMentees(@PathVariable String mentorId) {
        List<MenteeInfoDTO> mentees = matchService.getMenteesForMentor(mentorId);
        return ResponseEntity.ok(mentees);
    }

    /** 요청 바디 DTO */
    public record MatchRequest(String menteeUserId, String mentorUserId) {}
}