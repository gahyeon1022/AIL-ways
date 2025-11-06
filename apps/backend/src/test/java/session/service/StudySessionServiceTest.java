package session.service;

import board.domain.Board;
import board.repository.BoardRepository;
import board.service.BoardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import report.domain.Report;
import report.repository.ReportRepository;
import report.service.ReportService;
import session.domain.*;
import session.dto.StudySessionDTO;
import session.repository.StudySessionRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudySessionServiceTest {

    @Mock
    private StudySessionRepository studySessionRepository;

    @Mock
    private ReportService reportService;

    @Mock
    private BoardService boardService;

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private VisionAiClient visionAiClient;

    @InjectMocks
    private StudySessionService studySessionService;

    @Test
    void startSessionPersistsActiveSession() {
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> {
            StudySession toSave = invocation.getArgument(0);
            toSave.setSessionId("generated-session");
            return toSave;
        });

        StudySessionDTO dto = studySessionService.startSession("match-123", "mentee-1", "mentor-1");

        assertEquals("match-123", dto.matchId());
        assertEquals("mentee-1", dto.menteeUserId());
        assertEquals("mentor-1", dto.mentorUserId());
        assertEquals(SessionStatus.ACTIVE, dto.status());
        assertNotNull(dto.startedAt());
        assertEquals("generated-session", dto.sessionId());
        verify(studySessionRepository).save(any(StudySession.class));
    }

    @Test
    void addDistractionAppendsLogAndPausesSession() {
        StudySession session = StudySession.builder()
                .sessionId("session-1")
                .status(SessionStatus.ACTIVE)
                .distractionLogs(new ArrayList<>())
                .build();

        when(studySessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudySession result = studySessionService.addDistraction("session-1", "휴대폰 사용", "VISION_AI");

        assertEquals(1, result.getDistractionLogs().size());
        session.domain.DistractionLog log = result.getDistractionLogs().get(0);
        assertEquals("휴대폰 사용", log.getActivity());
        assertEquals("VISION_AI", log.getDetectionType());
        assertNotNull(log.getDetectedAt());
        assertEquals(SessionStatus.PAUSED, result.getStatus());
        verify(studySessionRepository).save(session);
    }

    @Test
    void addSelfFeedbackAttachesToLatestDistraction() {
        session.domain.DistractionLog log = session.domain.DistractionLog.builder()
                .activity("휴대폰 사용")
                .detectionType("VISION_AI")
                .detectedAt(Instant.now())
                .build();

        StudySession session = StudySession.builder()
                .sessionId("session-1")
                .distractionLogs(new ArrayList<>(List.of(log)))
                .build();

        when(studySessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelfFeedback feedback = SelfFeedback.builder()
                .comment("급한 전화였습니다.")
                .createdAt(Instant.now())
                .build();

        StudySession updated = studySessionService.addSelfFeedback("session-1", feedback);

        assertEquals(feedback, updated.getDistractionLogs().get(updated.getDistractionLogs().size() - 1).getSelfFeedback());
        verify(studySessionRepository).save(session);
    }

    @Test
    void addStudyLogPersistsContentWithTimestamp() {
        StudySession session = StudySession.builder()
                .sessionId("session-1")
                .studyLogs(new ArrayList<>())
                .build();

        when(studySessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudySession updated = studySessionService.addStudyLog("session-1", "정리한 내용");

        assertEquals(1, updated.getStudyLogs().size());
        StudyLog log = updated.getStudyLogs().get(0);
        assertEquals("정리한 내용", log.getContent());
        assertNotNull(log.getTimestamp());
        verify(studySessionRepository).save(session);
    }

    @Test
    void addQuestionLogPersistsQuestion() {
        StudySession session = StudySession.builder()
                .sessionId("session-1")
                .questionLogs(new ArrayList<>())
                .build();

        when(studySessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudySession updated = studySessionService.addQuestionLog("session-1", "이게 왜 그런가요?");

        assertEquals(1, updated.getQuestionLogs().size());
        QuestionLog log = updated.getQuestionLogs().get(0);
        assertEquals("이게 왜 그런가요?", log.getQuestion());
        assertNotNull(log.getCreatedAt());
        verify(studySessionRepository).save(session);
    }

    @Test
    void endSessionMarksCompletionAndPublishesArtifacts() {
        Instant startedAt = Instant.parse("2024-01-10T08:00:00Z");

        StudySession session = StudySession.builder()
                .sessionId("session-1")
                .matchId("match-1")
                .menteeUserId("mentee-1")
                .mentorUserId("mentor-1")
                .status(SessionStatus.ACTIVE)
                .startedAt(startedAt)
                .studyLogs(new ArrayList<>())
                .questionLogs(new ArrayList<>(List.of(
                        QuestionLog.builder()
                                .question("다음에는 어떻게 개선하나요?")
                                .createdAt(Instant.now())
                                .build()
                )))
                .distractionLogs(new ArrayList<>())
                .build();

        when(studySessionRepository.findById("session-1")).thenReturn(Optional.of(session));
        when(studySessionRepository.save(any(StudySession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reportRepository.findByMatchId("match-1")).thenReturn(List.of(mock(Report.class)));

        Board board = Board.builder()
                .id("board-1")
                .matchId("match-1")
                .memberUserIds(List.of("mentee-1", "mentor-1"))
                .entries(new ArrayList<>())
                .build();
        when(boardRepository.findByMatchId("match-1")).thenReturn(Optional.of(board));

        StudySession ended = studySessionService.endSession("session-1");

        assertEquals(SessionStatus.ENDED, ended.getStatus());
        assertNotNull(ended.getEndedAt());
        verify(reportService).createReportFromSession(session);
        verify(studySessionRepository).save(session);
        verify(reportRepository).findByMatchId("match-1");

        ArgumentCaptor<String> titleCaptor = ArgumentCaptor.forClass(String.class);
        verify(boardService).addEntryToBoard(eq("board-1"), eq("mentee-1"), titleCaptor.capture(), eq("다음에는 어떻게 개선하나요?"));

        String generatedTitle = titleCaptor.getValue();
        assertTrue(generatedTitle.startsWith("["));
        assertTrue(generatedTitle.contains("번째 학습]"));
    }
}
