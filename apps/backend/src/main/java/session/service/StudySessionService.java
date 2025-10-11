package session.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import report.service.ReportService;
import session.domain.*;
import session.dto.*;
import session.repository.StudySessionRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studyRepo;
    private final ReportService reportService;
    // 세션 시작
    @Transactional
    public StudySessionDTO startSession(String matchId, String menteeUserId, String mentorUserId) {
        StudySession session = StudySession.builder()
                .matchId(matchId)
                .menteeUserId(menteeUserId)
                .mentorUserId(mentorUserId)
                .status("ACTIVE")
                .startedAt(Instant.now())
                .build();

        StudySession saved = studyRepo.save(session);

        return toDto(saved);
    }

    // 세션 종료
    @Transactional
    public StudySession endSession(String sessionId) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));
        if ("ENDED".equals(session.getStatus()))
            throw new IllegalStateException("이미 종료된 세션입니다.");

        session.setEndedAt(Instant.now());
        session.setStatus("ENDED");
        StudySession ended = studyRepo.save(session);

        // ✅ ReportService 호출
        reportService.createReportFromSession(ended);

        return ended;
    }

    /**
     * 딴짓 감지 후 자기 피드백 포함해서 로그 추가
     */
    @Transactional
    public StudySession addDistraction(String sessionId, String activity) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        DistractionLog log = DistractionLog.builder()
                .activity(activity)
                .detectedAt(Instant.now())
                .build();

        session.getDistractionLogs().add(log);
        session.setStatus("PAUSED"); // 학습 일시정지
        return studyRepo.save(session);
    }

    @Transactional
    public StudySession addSelfFeedback(String sessionId, SelfFeedback selfFeedback) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        // 마지막 딴짓 로그에 피드백 추가
        List<DistractionLog> logs = session.getDistractionLogs();
        if (!logs.isEmpty()) {
            logs.get(logs.size() - 1).setSelfFeedback(selfFeedback);
        }

        return studyRepo.save(session);
    }
    /**
     * 자기 피드백 후 학습 재개
     */
    @Transactional
    public StudySession resumeSession(String sessionId) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("스터디 세션을 찾을 수 없습니다."));

        // 상태를 ACTIVE로 변경
        session.setStatus("ACTIVE");
        return studyRepo.save(session);
    }

    // 학습 내용 추가
    @Transactional
    public StudySession addStudyLog(String sessionId, String authorUserId, String content) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션 없음"));
        session.getStudyLogs().add(
                StudyLog.builder()
                        .authorUserId(authorUserId)
                        .content(content)
                        .timestamp(Instant.now())
                        .build()
        );
        return studyRepo.save(session);
    }

    //질문 내용 추가
    @Transactional
    public StudySession addQuestionLog(String sessionId, String authorUserId, String question) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다."));

        session.getQuestionLogs().add(
                QuestionLog.builder()
                        .authorUserId(authorUserId)
                        .question(question)
                        .createdAt(Instant.now())
                        .build()
        );

        return studyRepo.save(session);
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
                        new DistractionLogDTO(d.getActivity(), d.getDetectedAt(), feedbackDto)
                );
            }
        }

        List<StudyLogDTO> studyLogDTOs = new java.util.ArrayList<>();
        if (s.getStudyLogs() != null) {
            for (StudyLog l : s.getStudyLogs()) {
                studyLogDTOs.add(
                        new StudyLogDTO(l.getAuthorUserId(), l.getContent(), l.getTimestamp())
                );
            }
        }

        List<QuestionLogDTO> questionLogDTOs = new java.util.ArrayList<>();
        if (s.getQuestionLogs() != null) {
            for (QuestionLog q : s.getQuestionLogs()) {
                questionLogDTOs.add(
                        new QuestionLogDTO(q.getAuthorUserId(), q.getQuestion(), q.getCreatedAt())
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