package match.service;

import board.domain.Board;
import board.repository.BoardRepository;
import common.dto.ErrorCode;
import lombok.RequiredArgsConstructor;
import match.domain.Match;
import match.domain.MatchStatus;
import match.dto.MenteeInfoDTO;
import match.dto.MentorInfoDTO;
import match.exception.MatchException;
import match.repository.MatchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final UserRepository userRepo;
    private final MatchRepository matchRepo;
    private final BoardRepository boardRepo;
    private static final Duration RE_REQUEST_COOLDOWN = Duration.ofHours(24);

    @Transactional
    public Match requestMatch(String menteeUserId, String mentorUserId) {
        if (menteeUserId == null || mentorUserId == null) {
            throw new MatchException(ErrorCode.INVALID_REQUEST, "userId가 비어있습니다.");
        }
        if (menteeUserId.equals(mentorUserId)) {
            throw new MatchException(ErrorCode.MATCH_SELF_REQUEST, "본인에게는 매칭을 보낼 수 없습니다.");
        }

        User mentee = userRepo.findByUserId(menteeUserId)
                .orElseThrow(() -> new MatchException(ErrorCode.USER_NOT_FOUND, "존재하지 않는 멘티 아이디입니다."));
        User mentor = userRepo.findByUserId(mentorUserId)
                .orElseThrow(() -> new MatchException(ErrorCode.USER_NOT_FOUND, "존재하지 않는 멘토 아이디입니다."));

        if (mentee.getRole() != Role.MENTEE) {
            throw new MatchException(ErrorCode.MATCH_INVALID_ROLE, "멘티만 매칭을 요청할 수 있습니다.");
        }
        if (mentor.getRole() != Role.MENTOR) {
            throw new MatchException(ErrorCode.MATCH_INVALID_ROLE, "입력한 아이디는 멘토가 아닙니다.");
        }

        String id1 = menteeUserId;
        String id2 = mentorUserId;
        if (id1.compareTo(id2) > 0) {
            String temp = id1;
            id1 = id2;
            id2 = temp;
        }
        String pairKey = id1 + "::" + id2;

        Instant now = Instant.now();

        return matchRepo.findByPairKey(pairKey)
                .map(existing -> reopenIfEligible(existing, menteeUserId, mentorUserId, now))
                .orElseGet(() -> {
                    Match m = Match.builder()
                            .mentorUserId(mentorUserId)
                            .menteeUserId(menteeUserId)
                            .pairKey(pairKey)
                            .status(MatchStatus.PENDING)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();
                    return matchRepo.save(m);
                });
    }

    @Transactional
    public void accept(String matchId, String actingUserId) {
        Match m = matchRepo.findById(matchId)
                .orElseThrow(() -> new MatchException(ErrorCode.MATCH_NOT_FOUND, "매칭이 존재하지 않습니다."));
        if (!m.getMentorUserId().equals(actingUserId)) {
            throw new MatchException(ErrorCode.FORBIDDEN, "이 매칭을 수락할 권한이 없습니다.");
        }
        if (m.getStatus() == MatchStatus.ACCEPTED) return;

        m.setStatus(MatchStatus.ACCEPTED);
        m.setUpdatedAt(Instant.now());
        matchRepo.save(m);

        boardRepo.findByMatchId(matchId).orElseGet(() -> {
            Board b = Board.builder()
                    .matchId(matchId)
                    .pairKey(m.getPairKey())
                    .title("Q&A")
                    .memberUserIds(List.of(m.getMentorUserId(), m.getMenteeUserId()))
                    .createdAt(Instant.now())
                    .build();
            return boardRepo.save(b);
        });
    }

    @Transactional
    public void reject(String matchId, String actingUserId) {
        Match m = matchRepo.findById(matchId)
                .orElseThrow(() -> new MatchException(ErrorCode.MATCH_NOT_FOUND, "매칭이 존재하지 않습니다."));
        if (!m.getMentorUserId().equals(actingUserId)) {
            throw new MatchException(ErrorCode.FORBIDDEN, "이 매칭을 거절할 권한이 없습니다.");
        }
        if (m.getStatus() == MatchStatus.REJECTED) return;
        m.setStatus(MatchStatus.REJECTED);
        m.setUpdatedAt(Instant.now());
        matchRepo.save(m);
    }

    private Match reopenIfEligible(Match existing,
                                   String menteeUserId,
                                   String mentorUserId,
                                   Instant now) {
        if (!existing.getMenteeUserId().equals(menteeUserId) || !existing.getMentorUserId().equals(mentorUserId)) {
            throw new MatchException(ErrorCode.MATCH_ALREADY_EXISTS, "이미 존재하는 매칭입니다.");
        }

        if (existing.getStatus() == MatchStatus.ACCEPTED) {
            throw new MatchException(ErrorCode.MATCH_ALREADY_ACCEPTED, "이미 수락된 매칭입니다.");
        }
        if (existing.getStatus() == MatchStatus.PENDING) {
            throw new MatchException(ErrorCode.MATCH_ALREADY_PENDING, "이미 대기 중인 매칭입니다.");
        }

        Instant lastUpdated = existing.getUpdatedAt() != null ? existing.getUpdatedAt() : existing.getCreatedAt();
        if (lastUpdated != null) {
            Instant availableAt = lastUpdated.plus(RE_REQUEST_COOLDOWN);
            if (availableAt.isAfter(now)) {
                throw new MatchException(ErrorCode.MATCH_REQUEST_COOLDOWN, "거절된 요청은 24시간이 지난 후 다시 신청할 수 있습니다.");
            }
        }

        existing.setStatus(MatchStatus.PENDING);
        existing.setCreatedAt(now);
        existing.setUpdatedAt(now);
        return matchRepo.save(existing);
    }

    public List<MenteeInfoDTO> getMenteesForMentor(String mentorUserId) {
        List<Match> matches = matchRepo.findByMentorUserId(mentorUserId).stream()
                .filter(match -> match.getStatus() == MatchStatus.ACCEPTED)
                .toList();

        if (matches.isEmpty()) {
            return List.of();
        }

        List<String> menteeUserIds = matches.stream()
                .map(Match::getMenteeUserId)
                .toList();

        Map<String, User> menteeMap = userRepo.findAllByUserIdIn(menteeUserIds).stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));

        return matches.stream()
                .map(match -> {
                    User mentee = menteeMap.get(match.getMenteeUserId());
                    if (mentee == null) {
                        return null;
                    }
                    return new MenteeInfoDTO(
                            mentee.getUserId(),
                            mentee.getUserName(),
                            match.getMatchId()
                    );
                })
                .filter(Objects::nonNull) // null로 반환된 경우를 최종적으로 걸러냅니다.
                .toList();
    }
    public List<MentorInfoDTO> getMentorsForMentee(String menteeUserId) { //멘티가 매칭 중인 멘토 목록 조회를 위해 필요
        List<Match> matches = matchRepo.findByMenteeUserId(menteeUserId).stream()
                .filter(match -> match.getStatus() == MatchStatus.ACCEPTED)
                .toList();

        if (matches.isEmpty()) {
            return List.of();
        }

        List<String> mentorUserIds = matches.stream()
                .map(Match::getMentorUserId)
                .toList();

        Map<String, User> mentorMap = userRepo.findAllByUserIdIn(mentorUserIds).stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));

        return matches.stream()
                .map(match -> {
                    User mentor = mentorMap.get(match.getMentorUserId());
                    if (mentor == null) {
                        return null;
                    }
                    return new MentorInfoDTO(
                            mentor.getUserId(),
                            mentor.getUserName(),
                            match.getMatchId()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    // [추가된 부분] 멘토가 받은 '대기 중'인 매칭 요청 목록 조회
    public List<MenteeInfoDTO> getReceivedMatchesForMentor(String mentorUserId) {
        // 멘토 ID로 PENDING 상태인 매칭 목록을 찾습니다.
        List<Match> matches = matchRepo.findByMentorUserIdAndStatus(mentorUserId, MatchStatus.PENDING);

        if (matches.isEmpty()) {
            return List.of();
        }

        // 매칭 목록에서 멘티 ID 리스트를 추출합니다.
        List<String> menteeUserIds = matches.stream()
                .map(Match::getMenteeUserId)
                .toList();

        // 멘티 ID 리스트로 멘티 유저 정보를 한 번에 조회합니다.
        Map<String, User> menteeMap = userRepo.findAllByUserIdIn(menteeUserIds).stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));

        // 매칭 정보와 멘티 유저 정보를 조합하여 DTO 리스트를 생성합니다.
        return matches.stream()
                .map(match -> {
                    User mentee = menteeMap.get(match.getMenteeUserId());
                    if (mentee == null) {
                        return null; // 혹시 유저 정보가 없으면 null 반환
                    }
                    return new MenteeInfoDTO(
                            mentee.getUserId(),
                            mentee.getUserName(),
                            match.getMatchId()
                    );
                })
                .filter(Objects::nonNull) // null인 경우 최종 리스트에서 제외
                .toList();
    }

    // [추가된 부분] 멘티가 보낸 '대기 중'인 매칭 요청 목록 조회
    public List<MentorInfoDTO> getSentMatchesByMentee(String menteeUserId) {
        // 멘티 ID로 PENDING 상태인 매칭 목록을 찾습니다.
        List<Match> matches = matchRepo.findByMenteeUserIdAndStatus(menteeUserId, MatchStatus.PENDING);

        if (matches.isEmpty()) {
            return List.of();
        }

        // 매칭 목록에서 멘토 ID 리스트를 추출합니다.
        List<String> mentorUserIds = matches.stream()
                .map(Match::getMentorUserId)
                .toList();

        // 멘토 ID 리스트로 멘토 유저 정보를 한 번에 조회합니다.
        Map<String, User> mentorMap = userRepo.findAllByUserIdIn(mentorUserIds).stream()
                .collect(Collectors.toMap(User::getUserId, user -> user));

        // 매칭 정보와 멘토 유저 정보를 조합하여 DTO 리스트를 생성합니다.
        return matches.stream()
                .map(match -> {
                    User mentor = mentorMap.get(match.getMentorUserId());
                    if (mentor == null) {
                        return null; // 혹시 유저 정보가 없으면 null 반환
                    }
                    return new MentorInfoDTO(
                            mentor.getUserId(),
                            mentor.getUserName(),
                            match.getMatchId()
                    );
                })
                .filter(Objects::nonNull) // null인 경우 최종 리스트에서 제외
                .toList();
    }
}
