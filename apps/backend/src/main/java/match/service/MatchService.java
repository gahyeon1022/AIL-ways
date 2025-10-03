package match.service;

import board.domain.Board;
import board.repository.BoardRepository;
import match.domain.Match;
import match.domain.MatchStatus;
import match.dto.MenteeInfoDTO;
import match.dto.MentorInfoDTO;
import match.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

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

    // ... requestMatch, accept, reject 메서드는 이전과 동일 ...
    @Transactional
    public Match requestMatch(String menteeUserId, String mentorUserId) {
        if (menteeUserId == null || mentorUserId == null) {
            throw new IllegalArgumentException("userId가 비어있습니다.");
        }
        if (menteeUserId.equals(mentorUserId)) {
            throw new IllegalArgumentException("본인에게는 매칭을 보낼 수 없습니다.");
        }

        User mentee = userRepo.findByUserId(menteeUserId)
                .orElseThrow(() -> new IllegalArgumentException("멘티가 존재하지 않습니다."));
        User mentor = userRepo.findByUserId(mentorUserId)
                .orElseThrow(() -> new IllegalArgumentException("멘토가 존재하지 않습니다."));

        if (mentee.getRole() != Role.MENTEE) {
            throw new IllegalStateException("요청자는 MENTEE 역할이어야 합니다.");
        }
        if (mentor.getRole() != Role.MENTOR) {
            throw new IllegalStateException("대상자는 MENTOR 역할이어야 합니다.");
        }

        String id1 = menteeUserId;
        String id2 = mentorUserId;
        if (id1.compareTo(id2) > 0) {
            String temp = id1;
            id1 = id2;
            id2 = temp;
        }
        String pairKey = id1 + "::" + id2;

        matchRepo.findByPairKey(pairKey).ifPresent(m -> {
            throw new IllegalStateException("이미 존재하는 매칭입니다.");
        });

        Match m = Match.builder()
                .mentorUserId(mentorUserId)
                .menteeUserId(menteeUserId)
                .pairKey(pairKey)
                .status(MatchStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return matchRepo.save(m);
    }

    @Transactional
    public void accept(String matchId, String actingUserId) {
        Match m = matchRepo.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("매칭이 존재하지 않습니다."));
        if (!m.getMentorUserId().equals(actingUserId)) {
            throw new IllegalStateException("이 매칭을 수락할 권한이 없습니다.");
        }
        if (m.getStatus() == MatchStatus.ACCEPTED) return;

        m.setStatus(MatchStatus.ACCEPTED);
        m.setUpdatedAt(Instant.now());
        matchRepo.save(m);

        boardRepo.findByMatchId(matchId).orElseGet(() -> {
            Board b = Board.builder()
                    .matchId(matchId)
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
                .orElseThrow(() -> new IllegalArgumentException("매칭이 존재하지 않습니다."));
        if (!m.getMentorUserId().equals(actingUserId)) {
            throw new IllegalStateException("이 매칭을 거절할 권한이 없습니다.");
        }
        if (m.getStatus() == MatchStatus.REJECTED) return;
        m.setStatus(MatchStatus.REJECTED);
        m.setUpdatedAt(Instant.now());
        matchRepo.save(m);
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
                            match.getId()
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
                            match.getId()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }
}