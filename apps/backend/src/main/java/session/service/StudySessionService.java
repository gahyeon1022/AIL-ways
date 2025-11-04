package session.service;

import board.repository.BoardRepository;
import board.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import report.repository.ReportRepository;
import report.service.ReportService;
import session.domain.*;
import session.dto.*;
import session.repository.StudySessionRepository;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studyRepo;
    private final ReportService reportService;
    private final BoardService boardService;
    private final BoardRepository boardRepository;
    private final ReportRepository reportRepository;
    private final VisionAiClient visionAiClient;

    // 세션 시작
    @Transactional
    public StudySessionDTO startSession(String matchId, String menteeUserId, String mentorUserId) {
        StudySession session = StudySession.builder()
                .matchId(matchId)
                .menteeUserId(menteeUserId)
                .mentorUserId(mentorUserId)
                .status(SessionStatus.ACTIVE)
                .startedAt(Instant.now())
                .build();

        StudySession saved = studyRepo.save(session);

        return toDto(saved);
    }

    @Transactional
    public StudySession endSession(String sessionId) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));
        if (session.getStatus() == SessionStatus.ENDED)
            throw new IllegalStateException("이미 종료된 세션입니다.");

        session.setEndedAt(Instant.now());
        session.setStatus(SessionStatus.ENDED);

        // ✅ ReportService 호출 (기존 로직)
        reportService.createReportFromSession(session);

        // ✅ 2. 세션의 질문 로그를 Q&A 보드에 자동으로 추가하는 로직
        if (session.getQuestionLogs() != null && !session.getQuestionLogs().isEmpty()) {

            // 3. 제목에 사용할 날짜 포맷 지정 (YYYY.MM.DD)
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd")
                    .withZone(ZoneId.systemDefault());
            String formattedDate = formatter.format(session.getStartedAt());

            // 4. 몇 번째 세션인지 계산 (기존 리포트 개수 + 1)
            long sessionCount = reportRepository.findByMatchId(session.getMatchId()).size();
            long currentSessionNumber = sessionCount; // createReportFromSession이 먼저 호출되었으므로 +1 하지 않음

            String title = String.format("[%s %d번째 학습]", formattedDate, currentSessionNumber);

            // 5. 해당 매칭의 보드를 찾아서 질문들을 추가
            boardRepository.findByMatchId(session.getMatchId()).ifPresent(board -> {
                for (QuestionLog qLog : session.getQuestionLogs()) {
                    boardService.addEntryToBoard(
                            board.getId(),
                            session.getMenteeUserId(), //author == mentee -> session의 mentee id만 가져오면 됨!
                            title, // 새로 생성한 제목
                            qLog.getQuestion() // 질문 내용
                    );
                }
            });
        }

        StudySession ended = studyRepo.save(session);
        return ended;
    }


    /**
     * 딴짓 감지 후 자기 피드백 포함해서 로그 추가
     */
    @Transactional
    public StudySession addDistraction(String sessionId, String activity, String detectionType) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        appendDistraction(session, activity, detectionType);
        return studyRepo.save(session);
    }

    /**
     * Vision AI에 프레임을 전달하여 딴짓을 자동 감지합니다.
     */
    @Transactional
    public StudySession analyzeFrameAndAddDistraction(String sessionId, MultipartFile frame) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        boolean detected = visionAiClient.detectDistraction(sessionId, frame)
                .map(result -> {
                    appendDistraction(session, result.activity(), result.detectionType());
                    return true;
                })
                .orElse(false);

        return detected ? studyRepo.save(session) : session;
    }

    @Transactional
    public StudySession addSelfFeedback(String sessionId, SelfFeedback selfFeedback) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        List<DistractionLog> logs = session.getDistractionLogs();
        if (logs.isEmpty()) {
            // 예외를 던져서 클라이언트에게 잘못된 요청임을 알림
            throw new IllegalStateException("피드백을 추가할 딴짓 기록이 없습니다.");
        }

        DistractionLog lastLog = logs.get(logs.size() - 1);

        // 이미 피드백이 작성되었는지 확인하는 로직도 추가하면 더 좋습니다.
        if (lastLog.getSelfFeedback() != null) {
            throw new IllegalStateException("이미 피드백이 작성된 딴짓 기록입니다.");
        }

        lastLog.setSelfFeedback(selfFeedback);
        return studyRepo.save(session);
    }

    /**
     * 자기 피드백 후 학습 재개
     */
    @Transactional
    public StudySession resumeSession(String sessionId) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 세션을 찾을 수 없습니다."));

        // 상태를 ACTIVE로 변경(Enum)
        session.setStatus(SessionStatus.ACTIVE);
        return studyRepo.save(session);
    }

    // 학습 내용 추가
    @Transactional
    public StudySession addStudyLog(String sessionId, String content) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션 없음"));
        session.getStudyLogs().add(
                StudyLog.builder()
                        .content(content)
                        .timestamp(Instant.now())
                        .build()
        );
        return studyRepo.save(session);
    }

    //질문 내용 추가
    @Transactional
    public StudySession addQuestionLog(String sessionId, String question) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        session.getQuestionLogs().add(
                QuestionLog.builder()
                        .question(question)
                        .createdAt(Instant.now())
                        .build()
        );

        return studyRepo.save(session);
    }

    private void appendDistraction(StudySession session, String activity, String detectionType) {
        String source = (detectionType == null || detectionType.isBlank()) ? "UNKNOWN" : detectionType;

        DistractionLog log = DistractionLog.builder()
                .activity(activity)
                .detectedAt(Instant.now())
                .detectionType(source)
                .build();

        session.getDistractionLogs().add(log);
        session.setStatus(SessionStatus.PAUSED); // 학습 일시정지
    }

    private StudySessionDTO toDto(StudySession s) {

        List<DistractionLogDTO> distractionLogDTOs = new java.util.ArrayList<>();
        if (s.getDistractionLogs() != null) {
            for (DistractionLog d : s.getDistractionLogs()) {
                SelfFeedbackDTO feedbackDto = null;
                if (d.getSelfFeedback() != null) {
                    feedbackDto = new SelfFeedbackDTO(
                            d.getSelfFeedback().getComment(),
                            d.getSelfFeedback().getCreatedAt()
                    );
                }
                distractionLogDTOs.add(
                        new DistractionLogDTO(d.getActivity(), d.getDetectionType(), d.getDetectedAt(), feedbackDto)
                );
            }
        }

        List<StudyLogDTO> studyLogDTOs = new java.util.ArrayList<>();
        if (s.getStudyLogs() != null) {
            for (StudyLog l : s.getStudyLogs()) {
                studyLogDTOs.add(
                        new StudyLogDTO(l.getContent(), l.getTimestamp())
                );
            }
        }

        List<QuestionLogDTO> questionLogDTOs = new java.util.ArrayList<>();
        if (s.getQuestionLogs() != null) {
            for (QuestionLog q : s.getQuestionLogs()) {
                questionLogDTOs.add(
                        new QuestionLogDTO(q.getQuestion(), q.getCreatedAt())
                );
            }
        }

        return new StudySessionDTO(
                s.getSessionId(),
                s.getMatchId(),
                s.getMenteeUserId(),
                s.getMentorUserId(),
                s.getStartedAt(),
                s.getEndedAt(),
                s.getStatus(),
                distractionLogDTOs,
                studyLogDTOs,
                questionLogDTOs
        );
    }
}
