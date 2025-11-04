package match.controller;

import common.dto.ApiResponse;
import common.dto.ApiError;
import common.dto.ErrorCode;
import match.dto.MentorInfoDTO;
import org.springframework.security.access.prepost.PreAuthorize;
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

        User user = userRepository.findByUserId(userId) //역할이 멘티일 경우에만 가능
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));
        if (user.getRole() != Role.MENTEE) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "멘티만 매칭을 요청할 수 있습니다."));
        }

        return ApiResponse.ok(
                matchService.requestMatch(userId, req.mentorUserId())
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
    @Operation(summary = "멘티 목록 조회", description = "본인(멘토)과 매칭 중인 멘티 목록을 조회합니다.")
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

    /** 특정 멘티의 모든 멘토 목록 조회 */
    @Operation(summary = "멘토 목록 조회", description = "본인(멘티)과 매칭 중인 멘토 목록을 조회합니다.")
    @GetMapping("/myMentors")
    public ApiResponse<List<MentorInfoDTO>> getMyMentors(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        if (user.getRole() != Role.MENTEE) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "멘티만 접근할 수 있습니다."));
        }

        List<MentorInfoDTO> mentors = matchService.getMentorsForMentee(userId);
        return ApiResponse.ok(mentors);
    }
    @Operation(summary = "멘토가 받은 매칭 목록 조회", description = "본인(멘토)이 멘티로부터 받은 '대기 중'인 매칭 요청 목록을 조회합니다.")
    @GetMapping("/received")
    public ApiResponse<List<MenteeInfoDTO>> getReceivedMatches(Authentication auth) {
        String userId = auth.getName();
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        // 멘토만 이 API를 사용할 수 있음
        if (user.getRole() != Role.MENTOR) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "멘토만 접근할 수 있습니다."));
        }

        List<MenteeInfoDTO> matches = matchService.getReceivedMatchesForMentor(userId);
        return ApiResponse.ok(matches);
    }

    // [추가된 부분] 멘티가 보낸 매칭 목록 조회 (대기 중)
    @Operation(summary = "멘티가 보낸 매칭 목록 조회", description = "본인(멘티)이 멘토에게 보낸 '대기 중'인 매칭 요청 목록을 조회합니다.")
    @GetMapping("/{menteeId}/sent")
    public ApiResponse<List<MentorInfoDTO>> getSentMatches(@PathVariable String menteeId, Authentication auth) {
        String currentUserId = auth.getName();
        User user = userRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        // 본인의 요청 목록만 조회 가능하도록 검사
        if (!user.getUserId().equals(menteeId)) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "자신의 요청 목록만 조회할 수 있습니다."));
        }

        // 멘티만 이 API를 사용할 수 있음
        if (user.getRole() != Role.MENTEE) {
            return ApiResponse.error(new ApiError(ErrorCode.FORBIDDEN, "멘티만 접근할 수 있습니다."));
        }

        List<MentorInfoDTO> matches = matchService.getSentMatchesByMentee(menteeId);
        return ApiResponse.ok(matches);
    }
    // [여기까지]


    /** 요청 바디 DTO */
    public record MatchRequest(String mentorUserId) {}
}