package session.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import session.domain.*;
import session.repository.StudySessionRepository;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudySessionService {

    private final StudySessionRepository studyRepo;

    // 세션 시작
    @Transactional
    public StudySession startSession(String matchId, String menteeUserId, String mentorUserId) {
        StudySession session = StudySession.builder()
                .matchId(matchId)
                .menteeUserId(menteeUserId)
                .mentorUserId(mentorUserId)
                .status("ACTIVE")
                .startedAt(Instant.now())
                .build();
        return studyRepo.save(session);
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
        return studyRepo.save(session);
    }

    // 딴짓 로그 추가
    @Transactional
    public StudySession addDistraction(String sessionId, String activity, Instant detectedAt) {
        StudySession session = studyRepo.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("세션 없음"));
        session.getDistractionLogs().add(
                DistractionLog.builder().activity(activity).detectedAt(detectedAt).build()
        );
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

    // 조회
    public List<StudySession> getByMentee(String menteeUserId) {
        return studyRepo.findByMenteeUserId(menteeUserId);
    }

    public List<StudySession> getByMatch(String matchId) {
        return studyRepo.findByMatchId(matchId);
    }
}