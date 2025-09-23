package match.controller;

import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.dto.MenteeInfoDTO;
import match.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /** 멘티가 멘토 userId를 입력해서 매칭 요청 */
    @PostMapping("/matches/request")
    public ResponseEntity<Match> request(@RequestBody MatchRequest req) {
        return ResponseEntity.ok(
                matchService.requestMatch(req.menteeUserId(), req.mentorUserId())
        );
    }

    /** 멘토가 수락 */
    @PostMapping("/matches/{matchId}/accept")
    public ResponseEntity<Void> accept(@PathVariable String matchId,
                                       @RequestParam String actingUserId) {
        matchService.accept(matchId, actingUserId);
        return ResponseEntity.ok().build();
    }



    /** 멘토가 거절 */
    @PostMapping("/matches/{matchId}/reject")
    public ResponseEntity<Void> reject(@PathVariable String matchId,
                                       @RequestParam String actingUserId) {
        matchService.reject(matchId, actingUserId);
        return ResponseEntity.ok().build();
    }

    /** 특정 멘토의 모든 멘티 목록 조회 */
    @GetMapping("/mentors/{mentorId}/mentees")
    public ResponseEntity<List<MenteeInfoDTO>> getMentees(@PathVariable String mentorId) {
        List<MenteeInfoDTO> mentees = matchService.getMenteesForMentor(mentorId);
        return ResponseEntity.ok(mentees);
    }

    /** 요청 바디 DTO */
    public record MatchRequest(String menteeUserId, String mentorUserId) {}
}