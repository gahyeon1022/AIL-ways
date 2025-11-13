package match.service;

import board.repository.BoardRepository;
import match.domain.Match;
import match.domain.MatchStatus;
import match.repository.MatchRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import user.domain.Role;
import user.domain.User;
import user.repository.UserRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private MatchRepository matchRepository;
    @Mock
    private BoardRepository boardRepository;
    @InjectMocks
    private MatchService matchService;

    @Test
    void requestMatch_allowsReRequestAfter24Hours() {
        String menteeId = "mentee-100";
        String mentorId = "mentor-200";
        String pairKey = menteeId + "::" + mentorId;

        User mentee = User.builder().userId(menteeId).role(Role.MENTEE).build();
        User mentor = User.builder().userId(mentorId).role(Role.MENTOR).build();

        when(userRepository.findByUserId(menteeId)).thenReturn(Optional.of(mentee));
        when(userRepository.findByUserId(mentorId)).thenReturn(Optional.of(mentor));

        Match rejected = Match.builder()
                .matchId("match-1")
                .menteeUserId(menteeId)
                .mentorUserId(mentorId)
                .pairKey(pairKey)
                .status(MatchStatus.REJECTED)
                .createdAt(Instant.now().minus(Duration.ofDays(2)))
                .updatedAt(Instant.now().minus(Duration.ofHours(25)))
                .build();

        when(matchRepository.findByPairKey(pairKey)).thenReturn(Optional.of(rejected));
        when(matchRepository.save(rejected)).thenAnswer(invocation -> invocation.getArgument(0));

        Match reopened = matchService.requestMatch(menteeId, mentorId);

        assertEquals(MatchStatus.PENDING, reopened.getStatus());
        verify(matchRepository).save(rejected);
    }

    @Test
    void requestMatch_blocksReRequestWithinCooldown() {
        String menteeId = "mentee-100";
        String mentorId = "mentor-200";
        String pairKey = menteeId + "::" + mentorId;

        User mentee = User.builder().userId(menteeId).role(Role.MENTEE).build();
        User mentor = User.builder().userId(mentorId).role(Role.MENTOR).build();

        when(userRepository.findByUserId(menteeId)).thenReturn(Optional.of(mentee));
        when(userRepository.findByUserId(mentorId)).thenReturn(Optional.of(mentor));

        Match rejected = Match.builder()
                .matchId("match-1")
                .menteeUserId(menteeId)
                .mentorUserId(mentorId)
                .pairKey(pairKey)
                .status(MatchStatus.REJECTED)
                .createdAt(Instant.now().minus(Duration.ofDays(1)))
                .updatedAt(Instant.now().minus(Duration.ofHours(2)))
                .build();

        when(matchRepository.findByPairKey(pairKey)).thenReturn(Optional.of(rejected));

        assertThrows(IllegalStateException.class, () -> matchService.requestMatch(menteeId, mentorId));
        verify(matchRepository, never()).save(any(Match.class));
    }
}
