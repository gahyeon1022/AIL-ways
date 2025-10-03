package match.controller;

import common.dto.ApiResponse;
import common.dto.ApiError;
import common.dto.ErrorCode;
import org.springframework.security.core.Authentication;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.dto.MenteeInfoDTO;
import match.service.MatchService;
import org.springframework.web.bind.annotation.*;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.util.List;

@Tag(name = "Match API", description = "멘토-멘티 매칭 요청, 수락, 거절 API")
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final UserRepository userRepository;
    /** 멘티가 멘토 userId를 입력해서 매칭 요청 */
    @Operation(summary = "매칭 요청", description = "멘티가 멘토에게 매칭 요청을 보냅니다")
    @PostMapping("/request")
    public ApiResponse<Match> request(@RequestBody MatchRequest req, Authentication auth) {
        String userId = auth.getName();
        if (!userId.equals(req.menteeUserId())) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "접근 권한이 없습니다."));
        }
        return ApiResponse.ok(
                matchService.requestMatch(req.menteeUserId(), req.mentorUserId())
        );
    }

    /** 멘토가 수락 */
    @Operation(summary = "매칭 수락", description = "멘토가 멘티의 매칭 요청을 수락합니다")
    @PostMapping("/{matchId}/accept")
    public ApiResponse<Void> accept(@PathVariable String matchId, Authentication auth) {
        String userId = auth.getName();
        matchService.accept(matchId, userId);
        return ApiResponse.ok(null);
    }

    /** 멘토가 거절 */
    @Operation(summary = "매칭 거절", description = "멘토가 멘티의 매칭 요청을 거절합니다")
    @PostMapping("/{matchId}/reject")
    public ApiResponse<Void> reject(@PathVariable String matchId, Authentication auth) {
        String userId = auth.getName();
        matchService.reject(matchId, userId);
        return ApiResponse.ok(null);
    }
    /** 특정 멘토의 모든 멘티 목록 조회 */
    @GetMapping("/myMentees")
    public ApiResponse<List<MenteeInfoDTO>> getMentees(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        if (user.getRole() != Role.MENTOR) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "멘토만 접근할 수 있습니다."));
        }

        List<MenteeInfoDTO> mentees = matchService.getMenteesForMentor(userId);
        return ApiResponse.ok(mentees);

    }

    /** 요청 바디 DTO */
    public record MatchRequest(String menteeUserId, String mentorUserId) {}
}